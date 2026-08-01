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

export type InstitutionData = IdName & {
  city?: IdName | null
  state?: { id: number; name: string; abbreviation?: string } | null
  // Só presentes na resposta de GET /admin/institutions (painel admin).
  address?: string
  cep?: string
  nature_id?: number
}

export type ProfessionalData = {
  office?: IdName | null
  career?: IdName | null
  institution?: InstitutionData | null
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

// --- Stripe / Premium -----------------------------------------------------

export type StripeCustomer = {
  customer_id: string
  subscribed: boolean
}

/** Resposta de POST /stripe/subscription/monthly (formato do Stripe SDK). */
export type SubscriptionCreated = {
  subscriptionId: string
  latestInvoice?: {
    payment_intent?: {
      client_secret?: string | null
      status?: string
    } | string | null
  } | null
}

/** Item relevante de GET /stripe/subscriptions (lista de subscriptions do Stripe). */
export type StripeSubscription = {
  id: string
  status: string
  current_period_end?: number
  cancel_at_period_end?: boolean
}

export type StripeSubscriptionsResponse = {
  data: StripeSubscription[]
}

// --- Painel administrativo --------------------------------------------------

export type ReportedUser = { name: string; email: string } | null

export type FeedbackReport = {
  id: number
  report: string
  created_at: string
  user: ReportedUser
}

export type UserReportItem = {
  id: number
  reason: string
  observation: string | null
  created_at: string
  whistleblower: ReportedUser
  reported: ReportedUser
}

export type AdminUserListItem = {
  id: number
  cpf: string
  name: string
  email: string
  is_active: boolean
  is_deleted: boolean
  is_admin: boolean
}

export type AdminUserDetail = {
  id: number
  cpf: string
  is_active: boolean
  is_deleted: boolean
  is_admin: boolean
  profile: ProfileData | null
  professional: ProfessionalData | null
}
