/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface ProcessEnv {
    SUPABASE_URL: string
    SUPABASE_SERVICE_KEY: string
    DATABASE_URL: string
  }
}

export {} 