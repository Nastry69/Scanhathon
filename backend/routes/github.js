import express from 'express'
import { supabaseAdmin } from '../connexionDB.js'
import { encrypt, decrypt } from '../utils/crypto.js'

const router = express.Router()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

router.get('/', (req, res) => {
    const { token } = req.query
    if (!token) return res.status(400).send('Missing token')

    const state = Buffer.from(token).toString('base64url')
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: `${FRONTEND_URL}/auth/github/callback`,
        scope: 'read:user repo',
        state,
    })

    res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.post('/exchange', async (req, res) => {
    const { code, state } = req.body

    if (!code || !state) {
        return res.status(400).json({ error: 'Missing code or state' })
    }

    try {
        const token = Buffer.from(state, 'base64url').toString('utf8')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid session token' })
        }

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: `${FRONTEND_URL}/auth/github/callback`,
            }),
        })

        const tokenData = await tokenRes.json()
        if (tokenData.error || !tokenData.access_token) {
            return res.status(400).json({ error: tokenData.error_description || 'Failed to get GitHub token' })
        }

        const ghUserRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })
        const ghUser = await ghUserRes.json()

        if (!ghUserRes.ok || !ghUser.login) {
            return res.status(400).json({ error: 'Failed to fetch GitHub user profile' })
        }

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                github_access_token: encrypt(tokenData.access_token),
                github_username: ghUser.login,
            })
            .eq('id', user.id)

        if (updateError) throw updateError

        res.json({ github_username: ghUser.login })
    } catch (err) {
        console.error('GitHub OAuth exchange error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.delete('/disconnect', async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' })
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update({ github_access_token: null, github_username: null })
            .eq('id', user.id)

        if (error) throw error
        res.json({ message: 'GitHub disconnected' })
    } catch (err) {
        console.error('GitHub disconnect error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/repos', async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' })
        }

        const { data: userData, error: dbError } = await supabaseAdmin
            .from('users')
            .select('github_access_token')
            .eq('id', user.id)
            .single()

        if (dbError || !userData?.github_access_token) {
            return res.status(400).json({ error: 'GitHub not connected' })
        }

        const githubToken = decrypt(userData.github_access_token)

        const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        })

        if (!reposRes.ok) {
            return res.status(400).json({ error: 'Failed to fetch GitHub repos' })
        }

        const repos = await reposRes.json()
        res.json(repos.map(r => ({ id: r.id, name: r.name, full_name: r.full_name })))
    } catch (err) {
        console.error('GitHub repos error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
