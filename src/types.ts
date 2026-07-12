// Tipos de domínio do Redist, no formato que a API (via BFF) devolve.

export type IdName = { id: number; name: string }

export type StateItem = { id: number; name: string; abrev: string }

export type CboItem = {
  id: number
  code: number | string
  name: string
  synonym?: string
}

export type ProfileData = {
  first_name: string
  last_name: string
  date_birth: string
  phone: string
  email: string
  city?: IdName | null
  state?: { id: number; name: string; abbreviation?: string } | null
  photo_url?: string
  instagram?: string | null
}

export type ProfessionalData = {
  office?: IdName | null
  career?: IdName | null
  institution?: IdName | null
  registration?: string
  knowledge_area?: {
    general?: IdName | null
    specific?: IdName | null
  }
  cbo?: { id: number; code: number | string; title: string } | null
}

export type FullUser = {
  id: number
  cpf: string
  profile: ProfileData | null
  professional: ProfessionalData | null
}

export type Intention = {
  id: number
  institution: IdName | null
}

export type IntentionsResponse = {
  professional: unknown
  total: number
  intentions: Intention[]
}

export type Match = {
  user_id?: number
  profile: ProfileData | null
  professional: ProfessionalData | null
  score: number
  date: string
}

export type MatchesResponse = {
  total: number
  matches: Match[]
}
