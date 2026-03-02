import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { supabase, supabaseAdmin } from '../connexionDB.js'

const router = express.Router()

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body

        if (!username || username.trim().length === 0)
            return res.status(400).json({ error: 'Username is required' })

        if (username.trim().length < 3)
            return res.status(400).json({ error: 'Username must be at least 3 characters' })

        if (username.trim().length > 30)
            return res.status(400).json({ error: 'Username must be at most 30 characters' })

        const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError

        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({ id: user.id, username })
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        res.json({
            access_token: data.session.access_token,
            user: data.user
        })
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
})

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// PUT /api/users/me
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { username } = req.body

        if (!username || username.trim().length === 0)
            return res.status(400).json({ error: 'Username is required' })

        if (username.trim().length < 3)
            return res.status(400).json({ error: 'Username must be at least 3 characters' })

        if (username.trim().length > 30)
            return res.status(400).json({ error: 'Username must be at most 30 characters' })

        const { data, error } = await req.supabase
            .from('users')
            .update({ username })
            .eq('id', req.user.id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// DELETE /api/users/me
router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const { error: deleteProfileError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', req.user.id)

        if (deleteProfileError) throw deleteProfileError

        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(req.user.id)
        if (deleteAuthError) throw deleteAuthError

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
