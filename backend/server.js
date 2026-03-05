import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import scanRouter from './routes/scan.js'
import usersRouter from './routes/users.js'
import analysesRouter from './routes/analyses.js'
import vulnerabilitiesRouter from './routes/vulnerabilities.js'
import githubRouter from './routes/github.js'
import { swaggerSpec } from './swagger.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

// Routes
app.use("/", scanRouter);
app.use('/api/users', usersRouter)
app.use('/api/analyses', analysesRouter)
app.use('/api/vulnerabilities', vulnerabilitiesRouter)
app.use('/auth/github', githubRouter)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`)
})