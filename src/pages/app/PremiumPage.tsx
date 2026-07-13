import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Check, Crown, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { configRequest } from '@/lib/api'
import {
  getStripeCustomer,
  getStripeSubscriptions,
  createMonthlySubscription,
  cancelSubscription,
} from '@/lib/resources'
import type { SubscriptionCreated } from '@/types'

const BENEFITS = [
  'Até 3 intenções de permuta simultâneas',
  'Mais alcance de compatibilidade nos matches',
  'Prioridade no suporte',
]

// A instância do Stripe.js é cara de criar — memoize por chave publicável para
// não recriar a cada render/remontagem da página.
const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  let cached = stripeCache.get(publishableKey)
  if (!cached) {
    cached = loadStripe(publishableKey)
    stripeCache.set(publishableKey, cached)
  }
  return cached
}

function extractClientSecret(sub: SubscriptionCreated): string | null {
  const invoice = sub.latestInvoice
  if (!invoice || typeof invoice === 'string') return null
  const pi = invoice.payment_intent
  if (!pi || typeof pi === 'string') return null
  return pi.client_secret ?? null
}

function formatDate(unixSeconds?: number): string | null {
  if (!unixSeconds) return null
  return new Date(unixSeconds * 1000).toLocaleDateString('pt-BR')
}

function CheckoutForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/painel/premium`,
      },
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Não foi possível processar o pagamento. Tente novamente.')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onSuccess()
      return
    }

    setError('Pagamento não confirmado. Verifique os dados do cartão e tente novamente.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorState message={error} />}
      <PaymentElement />
      <p className="text-xs text-slate-500">
        Ambiente de teste: use o cartão 4242 4242 4242 4242, qualquer validade futura e CVC.
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="match" disabled={!stripe || !elements || submitting}>
          {submitting ? 'Processando…' : 'Confirmar assinatura'}
        </Button>
      </div>
    </form>
  )
}

export default function PremiumPage() {
  const { data, loading, error, reload } = useAsync(getStripeCustomer)

  const [publishableKey, setPublishableKey] = useState('')
  const [renewsAt, setRenewsAt] = useState<string | null>(null)
  const [cancelsAtPeriodEnd, setCancelsAtPeriodEnd] = useState(false)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [justSubscribed, setJustSubscribed] = useState(false)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  useEffect(() => {
    configRequest().then((c) => setPublishableKey(c.stripePublishableKey))
  }, [])

  useEffect(() => {
    if (!data?.subscribed) return
    getStripeSubscriptions()
      .then((subs) => {
        const active = subs.data.find((s) => s.status === 'active') ?? subs.data[0]
        setRenewsAt(formatDate(active?.current_period_end))
        setCancelsAtPeriodEnd(Boolean(active?.cancel_at_period_end))
      })
      .catch(() => undefined)
  }, [data?.subscribed])

  const stripePromise = useMemo(
    () => (publishableKey ? getStripePromise(publishableKey) : null),
    [publishableKey],
  )

  async function handleStartCheckout() {
    setStarting(true)
    setStartError(null)
    try {
      const sub = await createMonthlySubscription()
      const secret = extractClientSecret(sub)
      if (!secret) {
        throw new Error('Não foi possível iniciar o pagamento. Tente novamente em instantes.')
      }
      setClientSecret(secret)
      setCheckoutOpen(true)
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Não foi possível iniciar a assinatura.')
    } finally {
      setStarting(false)
    }
  }

  function handleCheckoutSuccess() {
    setCheckoutOpen(false)
    setClientSecret(null)
    setJustSubscribed(true)
    reload()
  }

  async function handleCancel() {
    setCancelling(true)
    setCancelError(null)
    try {
      await cancelSubscription()
      setCancelOpen(false)
      reload()
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : 'Não foi possível cancelar a assinatura.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div>
      <PageHeader title="Premium" subtitle="Amplie suas chances de encontrar a permuta ideal." />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {justSubscribed && data?.subscribed && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-match-200 bg-match-50 px-4 py-3 text-match-700">
          <ShieldCheck size={18} className="shrink-0" />
          <p className="text-sm">Assinatura confirmada! Agora você pode ter até 3 intenções ativas.</p>
        </div>
      )}

      {data && !data.subscribed && (
        <div className="max-w-xl rounded-2xl border-2 border-match-600 bg-white p-8 shadow-lg shadow-match-600/10">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-match-50 text-match-600">
              <Crown size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Redist Premium</h2>
              <p className="text-sm text-slate-500">Para quem quer ampliar as chances de permuta.</p>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-navy-900">R$ 19,90</span>
            <span className="text-slate-500">/mês</span>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[0.95rem] text-slate-700">
                <Check size={20} className="mt-0.5 shrink-0 text-match-600" />
                {b}
              </li>
            ))}
          </ul>

          {startError && (
            <div className="mt-6">
              <ErrorState message={startError} />
            </div>
          )}

          <Button
            variant="match"
            size="lg"
            className="mt-8 w-full"
            onClick={handleStartCheckout}
            disabled={starting || !publishableKey}
          >
            {starting ? 'Preparando pagamento…' : 'Assinar Premium'}
          </Button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Valor de exemplo — a definir antes do lançamento.
          </p>
        </div>
      )}

      {data && data.subscribed && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-match-50 text-match-600">
              <Crown size={22} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Você é Premium</h2>
              <p className="text-sm text-slate-500">
                {cancelsAtPeriodEnd
                  ? renewsAt
                    ? `Cancelada — acesso até ${renewsAt}.`
                    : 'Assinatura cancelada, ativa até o fim do período.'
                  : renewsAt
                    ? `Renova em ${renewsAt}.`
                    : 'Assinatura ativa.'}
              </p>
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[0.95rem] text-slate-700">
                <Check size={20} className="mt-0.5 shrink-0 text-match-600" />
                {b}
              </li>
            ))}
          </ul>

          {!cancelsAtPeriodEnd && (
            <Button
              variant="secondary"
              className="mt-8"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar assinatura
            </Button>
          )}
        </div>
      )}

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Assinar Premium"
      >
        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              onSuccess={handleCheckoutSuccess}
              onCancel={() => setCheckoutOpen(false)}
            />
          </Elements>
        ) : (
          <Spinner />
        )}
      </Modal>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar assinatura">
        <p className="text-slate-600">
          Sua assinatura Premium continuará ativa até o fim do período já pago. Depois disso,
          você volta ao plano gratuito (1 intenção ativa).
        </p>
        {cancelError && (
          <div className="mt-4">
            <ErrorState message={cancelError} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={cancelling}>
            Manter assinatura
          </Button>
          <Button
            variant="primary"
            onClick={handleCancel}
            disabled={cancelling}
            className="bg-red-600 hover:bg-red-700"
          >
            {cancelling ? 'Cancelando…' : 'Cancelar assinatura'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
