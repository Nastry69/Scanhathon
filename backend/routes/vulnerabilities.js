import express from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/vulnerabilities/:analysisId
router.get('/:analysisId', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('vulnerabilities')
            .select('*')
            .eq('analysis_id', req.params.analysisId)
            .order('severity', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// GET /api/vulnerabilities/:analysisId/tool/:tool
router.get('/:analysisId/tool/:tool', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('vulnerabilities')
            .select('*')
            .eq('analysis_id', req.params.analysisId)
            .eq('tool', req.params.tool)
            .order('severity', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/vulnerabilities
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { vulnerabilities } = req.body

        const { data, error } = await req.supabase
            .from('vulnerabilities')
            .insert(vulnerabilities)
            .select()

        if (error) throw error
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
