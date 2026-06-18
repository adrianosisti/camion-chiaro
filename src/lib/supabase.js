const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let supabaseClientPromise = null

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey),
    )
  }

  return supabaseClientPromise
}

export async function fetchComplianceItems(companyId) {
  const supabase = await getSupabaseClient()

  if (!supabase || !companyId) {
    return { data: null, error: null }
  }

  return supabase
    .from('compliance_items')
    .select(
      `
        id,
        type,
        scope,
        due_date,
        reminder_days,
        owner,
        status,
        document_number,
        last_reminder_at,
        drivers:driver_id(id, full_name, role, depot),
        vehicles:vehicle_id(id, plate, model, type)
      `,
    )
    .eq('company_id', companyId)
    .neq('status', 'archived')
    .order('due_date', { ascending: true })
}

export async function signUpCompany({ email, password, companyName }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: 'company',
        company_name: companyName,
      },
    },
  })
}

export async function signInCompany({ email, password }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInDriver({ username, password }) {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { data: null, error: null, demo: true }
  }

  const driverAuthDomain = import.meta.env.VITE_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
  const cleanUsername = username.trim().toLowerCase()
  const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@${driverAuthDomain}`

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = await getSupabaseClient()

  if (!supabase) {
    return { error: null, demo: true }
  }

  return supabase.auth.signOut()
}
