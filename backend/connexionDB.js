import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
}

// Client anon — pour signUp/signIn uniquement
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin — bypass RLS, pour les opérations serveur
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Crée un client avec le JWT de l'utilisateur — respecte le RLS
export const createUserClient = (accessToken) =>
    createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })