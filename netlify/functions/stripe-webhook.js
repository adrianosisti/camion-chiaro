import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripeApiVersion = '2026-02-25.clover'

function response(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode,
  }
}

function getHeader(headers, key) {
  const lowerKey = key.toLowerCase()
  const match = Object.entries(headers ?? {}).find(([headerKey]) => headerKey.toLowerCase() === lowerKey)
  return match?.[1] ?? ''
}

function getRawBody(event) {
  if (event.isBase64Encoded) {
    return Buffer.from(event.body || '', 'base64').toString('utf8')
  }

  return event.body || ''
}

function timestampToIso(timestamp) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

function timestampToDate(timestamp) {
  return timestamp ? new Date(timestamp * 1000).toISOString().slice(0, 10) : null
}

function getSubscriptionId(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : value.id ?? ''
}

function getCustomerId(value) {
  if (!value) return ''
  return typeof value === 'string' ? value : value.id ?? ''
}

function getSubscriptionPeriodEnd(subscription) {
  return (
    subscription.current_period_end ||
    subscription.items?.data?.[0]?.current_period_end ||
    subscription.trial_end ||
    null
  )
}

function mapSubscriptionStatus(status) {
  if (['active', 'trialing'].includes(status)) return 'active'
  if (['past_due', 'incomplete', 'unpaid'].includes(status)) return 'past_due'
  if (['paused'].includes(status)) return 'suspended'
  if (['canceled', 'incomplete_expired'].includes(status)) return 'cancelled'
  return 'pending'
}

function getInvoiceNumber(invoice) {
  return invoice.number || invoice.id
}

function compactPayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
}

function isMissingRelation(error) {
  return ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error?.code)
}

function mapInvoiceStatus(status) {
  if (status === 'void') return 'cancelled'
  return status || 'open'
}

async function updateContractEnvelope(serviceClient, {
  companyId,
  contractEnvelopeId,
  eventPayload = {},
  eventType,
  status,
  values = {},
}) {
  if (!contractEnvelopeId || !companyId) return

  const updatedAt = new Date().toISOString()
  const { error } = await serviceClient
    .from('company_contract_envelopes')
    .update(compactPayload({
      status,
      updated_at: updatedAt,
      ...values,
    }))
    .eq('id', contractEnvelopeId)
    .eq('company_id', companyId)

  if (isMissingRelation(error)) return
  if (error) throw error

  if (!eventType) return

  const { error: eventError } = await serviceClient
    .from('company_contract_events')
    .insert({
      company_id: companyId,
      envelope_id: contractEnvelopeId,
      event_payload: eventPayload,
      event_type: eventType,
    })

  if (isMissingRelation(eventError)) return
  if (eventError) throw eventError
}

async function findCompanyForSubscription(serviceClient, subscription) {
  const companyId = subscription.metadata?.company_id
  if (companyId) return { data: { id: companyId }, error: null }

  const subscriptionId = getSubscriptionId(subscription.id)
  const customerId = getCustomerId(subscription.customer)

  if (subscriptionId) {
    const bySubscription = await serviceClient
      .from('companies')
      .select('id')
      .eq('billing_subscription_id', subscriptionId)
      .maybeSingle()
    if (bySubscription.data || bySubscription.error) return bySubscription
  }

  if (customerId) {
    return serviceClient.from('companies').select('id').eq('billing_customer_id', customerId).maybeSingle()
  }

  return { data: null, error: null }
}

async function findCompanyForInvoice(serviceClient, invoice) {
  const subscriptionId = getSubscriptionId(invoice.subscription)
  const customerId = getCustomerId(invoice.customer)

  if (subscriptionId) {
    const bySubscription = await serviceClient
      .from('companies')
      .select('id, billing_plan')
      .eq('billing_subscription_id', subscriptionId)
      .maybeSingle()

    if (bySubscription.data || bySubscription.error) return bySubscription
  }

  if (customerId) {
    return serviceClient
      .from('companies')
      .select('id, billing_plan')
      .eq('billing_customer_id', customerId)
      .maybeSingle()
  }

  return { data: null, error: null }
}

async function updateCompanyFromSubscription(serviceClient, subscription, extraValues = {}) {
  const companyResult = await findCompanyForSubscription(serviceClient, subscription)

  if (companyResult.error) {
    throw companyResult.error
  }

  if (!companyResult.data?.id) {
    return
  }

  const status = mapSubscriptionStatus(subscription.status)
  const periodEnd = getSubscriptionPeriodEnd(subscription)

  const { error } = await serviceClient
    .from('companies')
    .update(compactPayload({
      billing_activated_at: status === 'active' ? new Date().toISOString() : undefined,
      billing_current_period_end: timestampToIso(periodEnd),
      billing_customer_id: getCustomerId(subscription.customer) || undefined,
      billing_provider: 'stripe',
      billing_status: status,
      billing_subscription_id: getSubscriptionId(subscription.id) || undefined,
      updated_at: new Date().toISOString(),
      ...extraValues,
    }))
    .eq('id', companyResult.data.id)

  if (error) throw error

  const contractEnvelopeId = subscription.metadata?.contract_envelope_id || extraValues.contract_envelope_id
  const contractStatus = status === 'active'
    ? 'payment_active'
    : status === 'cancelled'
      ? 'cancelled'
      : ['past_due', 'suspended'].includes(status)
        ? 'payment_failed'
        : undefined

  if (contractEnvelopeId && contractStatus) {
    await updateContractEnvelope(serviceClient, {
      companyId: companyResult.data.id,
      contractEnvelopeId,
      eventPayload: {
        billingStatus: status,
        stripeCustomerId: getCustomerId(subscription.customer),
        stripeSubscriptionId: getSubscriptionId(subscription.id),
      },
      eventType: status === 'active' ? 'payment_active' : `subscription_${status}`,
      status: contractStatus,
      values: {
        activated_at: status === 'active' ? new Date().toISOString() : undefined,
        cancelled_at: status === 'cancelled' ? new Date().toISOString() : undefined,
        stripe_customer_id: getCustomerId(subscription.customer) || undefined,
        stripe_subscription_id: getSubscriptionId(subscription.id) || undefined,
      },
    })
  }
}

async function upsertInvoice(serviceClient, invoice) {
  const companyResult = await findCompanyForInvoice(serviceClient, invoice)

  if (companyResult.error) {
    throw companyResult.error
  }

  if (!companyResult.data?.id) {
    return
  }

  const invoiceNumber = getInvoiceNumber(invoice)
  const { error } = await serviceClient
    .from('company_invoices')
    .upsert(
      {
        amount_cents: invoice.total ?? invoice.amount_due ?? 0,
        billing_provider: 'stripe',
        company_id: companyResult.data.id,
        currency: invoice.currency ?? 'eur',
        due_at: timestampToDate(invoice.due_date),
        external_invoice_id: invoice.id,
        invoice_number: invoiceNumber,
        issued_at: timestampToDate(invoice.created) ?? new Date().toISOString().slice(0, 10),
        paid_at: invoice.status === 'paid' ? timestampToIso(invoice.status_transitions?.paid_at) ?? new Date().toISOString() : null,
        pdf_path: invoice.invoice_pdf || invoice.hosted_invoice_url || null,
        status: mapInvoiceStatus(invoice.status),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'company_id,invoice_number' },
    )

  if (error) throw error
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Metodo non consentito.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey || !webhookSecret) {
    return response(500, { error: 'Configurazione webhook Stripe mancante.' })
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: stripeApiVersion })
  const signature = getHeader(event.headers, 'stripe-signature')
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(getRawBody(event), signature, webhookSecret)
  } catch (error) {
    return response(400, { error: `Firma webhook non valida: ${error.message}` })
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const sessionCompanyId = session.metadata?.company_id
      const sessionEnvelopeId = session.metadata?.contract_envelope_id

      if (sessionCompanyId && sessionEnvelopeId) {
        await updateContractEnvelope(serviceClient, {
          companyId: sessionCompanyId,
          contractEnvelopeId: sessionEnvelopeId,
          eventPayload: {
            checkoutSessionId: session.id,
            stripeCustomerId: getCustomerId(session.customer),
          },
          eventType: 'checkout_completed',
          status: 'checkout_completed',
          values: {
            checkout_completed_at: new Date().toISOString(),
            stripe_checkout_session_id: session.id,
            stripe_customer_id: getCustomerId(session.customer) || undefined,
          },
        })
      }

      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(getSubscriptionId(session.subscription))
        await updateCompanyFromSubscription(serviceClient, subscription, {
          billing_email: session.customer_details?.email || undefined,
          billing_plan: session.metadata?.plan || subscription.metadata?.plan || undefined,
        })
      }
    }

    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(stripeEvent.type)) {
      await updateCompanyFromSubscription(serviceClient, stripeEvent.data.object, {
        billing_plan: stripeEvent.data.object.metadata?.plan || undefined,
      })
    }

    if (['invoice.payment_succeeded', 'invoice.paid'].includes(stripeEvent.type)) {
      const invoice = stripeEvent.data.object
      await upsertInvoice(serviceClient, invoice)

      const subscriptionId = getSubscriptionId(invoice.subscription)
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await updateCompanyFromSubscription(serviceClient, subscription)
      }
    }

    if (stripeEvent.type === 'invoice.payment_failed') {
      const invoice = stripeEvent.data.object
      await upsertInvoice(serviceClient, invoice)

      const companyResult = await findCompanyForInvoice(serviceClient, invoice)
      if (companyResult.error) throw companyResult.error

      if (companyResult.data?.id) {
        const { error } = await serviceClient
          .from('companies')
          .update({
            billing_status: 'past_due',
            billing_note: 'Pagamento Stripe non riuscito.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', companyResult.data.id)

        if (error) throw error
      }
    }
  } catch (error) {
    return response(500, { error: error.message ?? 'Errore webhook Stripe.' })
  }

  return response(200, { received: true })
}
