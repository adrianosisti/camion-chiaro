import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
export const driverAuthDomain = process.env.EXPO_PUBLIC_DRIVER_AUTH_DOMAIN ?? 'drivers.camionchiaro.app'
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? ''
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: AsyncStorage,
      },
    })
  : null

