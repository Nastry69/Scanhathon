import { createUserClient } from '../connexionDB.js'

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const client = createUserClient(token)

    const { data: { user }, error } = await client.auth.getUser()
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.supabase = client
    req.user = user
    next()
}
