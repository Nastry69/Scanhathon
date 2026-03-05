import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

const getKey = () => {
    const secret = process.env.GITHUB_TOKEN_SECRET
    if (!secret || secret.length !== 64) {
        throw new Error('GITHUB_TOKEN_SECRET must be a 64-character hex string (32 bytes)')
    }
    return Buffer.from(secret, 'hex')
}

// Retourne une chaîne "iv:authTag:données" stockable en DB
export const encrypt = (plaintext) => {
    const key = getKey()
    const iv = randomBytes(12) // 96-bit IV recommandé pour GCM
    const cipher = createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag() // 16 bytes, garantit l'intégrité
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

// Inverse de encrypt()
export const decrypt = (ciphertext) => {
    const key = getKey()
    const parts = ciphertext.split(':')
    if (parts.length !== 3) throw new Error('Invalid ciphertext format')
    const [ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
