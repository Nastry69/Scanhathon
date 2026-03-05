export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'SecureScan API',
        version: '1.0.0',
        description: 'API de scan de vulnérabilités pour dépôts Git',
    },
    servers: [
        { url: 'http://localhost:3000', description: 'Serveur de développement' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    username: { type: 'string' },
                    github_username: { type: 'string', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                }
            },
            Analysis: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    user_id: { type: 'string', format: 'uuid' },
                    repo_url: { type: 'string' },
                    repo_name: { type: 'string' },
                    branch: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                    score: { type: 'integer', minimum: 0, maximum: 100, nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                }
            },
            Vulnerability: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    analysis_id: { type: 'string', format: 'uuid' },
                    tool: { type: 'string', enum: ['npm_audit', 'snyk', 'eslint', 'semgrep'] },
                    A0number: { type: 'string', enum: ['A03:2025', 'A04:2025', 'A05:2025'], nullable: true },
                    severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
                    title: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    file_path: { type: 'string', nullable: true },
                    line_start: { type: 'integer', nullable: true },
                    code_snippet: { type: 'string', nullable: true },
                    recommendation: { type: 'string', nullable: true },
                    raw: { type: 'object', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/api/users/register': {
            post: {
                summary: 'Créer un compte',
                tags: ['Users'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'username'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', format: 'password' },
                                    username: { type: 'string', minLength: 3, maxLength: 30 },
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Utilisateur créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/users/login': {
            post: {
                summary: 'Se connecter',
                tags: ['Users'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', format: 'password' },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Connexion réussie',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        access_token: { type: 'string' },
                                        user: { type: 'object' },
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Identifiants invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/users/me': {
            get: {
                summary: 'Obtenir le profil courant',
                tags: ['Users'],
                responses: {
                    200: { description: 'Profil utilisateur', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            },
            put: {
                summary: 'Mettre à jour le profil courant',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username'],
                                properties: {
                                    username: { type: 'string', minLength: 3, maxLength: 30 },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Profil mis à jour', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            },
            delete: {
                summary: 'Supprimer le compte courant',
                tags: ['Users'],
                responses: {
                    204: { description: 'Compte supprimé' },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/users/me/password': {
            put: {
                summary: 'Modifier le mot de passe',
                tags: ['Users'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['password', 'newPassword'],
                                properties: {
                                    password: { type: 'string', format: 'password', description: 'Mot de passe actuel' },
                                    newPassword: { type: 'string', format: 'password', minLength: 6, description: 'Nouveau mot de passe' },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Mot de passe mis à jour', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
                    400: { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    401: { description: 'Mot de passe actuel incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/analyses': {
            get: {
                summary: "Lister les analyses de l'utilisateur courant",
                tags: ['Analyses'],
                responses: {
                    200: { description: 'Liste des analyses', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Analysis' } } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            },
            post: {
                summary: 'Créer une nouvelle analyse',
                tags: ['Analyses'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['repo_url', 'repo_name', 'branch'],
                                properties: {
                                    repo_url: { type: 'string', example: 'https://github.com/user/repo' },
                                    repo_name: { type: 'string', example: 'user/repo' },
                                    branch: { type: 'string', example: 'main' },
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Analyse créée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Analysis' } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/analyses/{id}': {
            get: {
                summary: 'Obtenir une analyse par ID',
                tags: ['Analyses'],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: "ID de l'analyse" }
                ],
                responses: {
                    200: { description: "Détails de l'analyse", content: { 'application/json': { schema: { $ref: '#/components/schemas/Analysis' } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            },
            delete: {
                summary: 'Supprimer une analyse',
                tags: ['Analyses'],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: "ID de l'analyse" }
                ],
                responses: {
                    204: { description: 'Analyse supprimée' },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/vulnerabilities/{analysisId}': {
            get: {
                summary: "Lister les vulnérabilités d'une analyse",
                tags: ['Vulnerabilities'],
                parameters: [
                    { in: 'path', name: 'analysisId', required: true, schema: { type: 'string', format: 'uuid' }, description: "ID de l'analyse" }
                ],
                responses: {
                    200: { description: 'Liste des vulnérabilités triées par sévérité', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Vulnerability' } } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/vulnerabilities/{analysisId}/tool/{tool}': {
            get: {
                summary: "Lister les vulnérabilités d'une analyse filtrées par outil",
                tags: ['Vulnerabilities'],
                parameters: [
                    { in: 'path', name: 'analysisId', required: true, schema: { type: 'string', format: 'uuid' }, description: "ID de l'analyse" },
                    { in: 'path', name: 'tool', required: true, schema: { type: 'string' }, description: 'Nom de l\'outil de scan (ex. semgrep, bandit)' },
                ],
                responses: {
                    200: { description: 'Liste des vulnérabilités filtrées', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Vulnerability' } } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/auth/github': {
            get: {
                summary: 'Initier le flow OAuth GitHub',
                tags: ['GitHub'],
                security: [],
                parameters: [
                    { in: 'query', name: 'token', required: true, schema: { type: 'string' }, description: 'JWT Supabase de la session courante' }
                ],
                responses: {
                    302: { description: 'Redirection vers GitHub OAuth' },
                    400: { description: 'Token manquant' },
                }
            }
        },
        '/auth/github/exchange': {
            post: {
                summary: 'Échanger le code OAuth contre un token GitHub',
                tags: ['GitHub'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['code', 'state'],
                                properties: {
                                    code: { type: 'string' },
                                    state: { type: 'string' },
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'GitHub connecté', content: { 'application/json': { schema: { type: 'object', properties: { github_username: { type: 'string' } } } } } },
                    400: { description: 'Code ou state invalide', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    401: { description: 'Session invalide', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/auth/github/disconnect': {
            delete: {
                summary: 'Déconnecter GitHub',
                tags: ['GitHub'],
                responses: {
                    200: { description: 'GitHub déconnecté', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
                    401: { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/auth/github/repos': {
            get: {
                summary: 'Lister les repos GitHub de l\'utilisateur connecté',
                tags: ['GitHub'],
                responses: {
                    200: {
                        description: 'Liste des repos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            name: { type: 'string' },
                                            full_name: { type: 'string' },
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'GitHub non connecté', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    401: { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
        '/api/vulnerabilities': {
            post: {
                summary: 'Insérer des vulnérabilités en masse',
                tags: ['Vulnerabilities'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['vulnerabilities'],
                                properties: {
                                    vulnerabilities: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['analysis_id', 'tool', 'severity', 'title'],
                                            properties: {
                                                analysis_id: { type: 'string', format: 'uuid' },
                                                tool: { type: 'string' },
                                                severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                                title: { type: 'string' },
                                                description: { type: 'string' },
                                                file: { type: 'string' },
                                                line: { type: 'integer' },
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Vulnérabilités insérées', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Vulnerability' } } } } },
                    401: { description: 'Non authentifié' },
                    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                }
            }
        },
    }
}
