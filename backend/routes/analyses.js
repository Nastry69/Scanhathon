import express from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/analyses
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('analyses')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// GET /api/analyses/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('analyses')
            .select('*')
            .eq('id', req.params.id)
            .single()

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/analyses
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { repo_url, repo_name, branch } = req.body

        const { data, error } = await req.supabase
            .from('analyses')
            .insert({ user_id: req.user.id, repo_url, repo_name, branch })
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// DELETE /api/analyses/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await req.supabase
            .from('analyses')
            .delete()
            .eq('id', req.params.id)

        if (error) throw error
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
