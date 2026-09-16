// ============================================================
// Stripe Integration — preparado para ativação futura
// ============================================================
// Fluxo atual usa pagamento manual (ver pagamentos.service.ts).
// Quando VITE_STRIPE_SECRET_KEY for configurada, este módulo
// substitui o fluxo manual.

import { supabase } from "~/lib/supabase"

/**
 * Cria PaymentIntent no Stripe.
 * Retorna clientSecret para confirmação client-side.
 * Sem chave Stripe configurada, retorna mock.
 */
export async function criarPaymentIntent(
  pedidoId: string,
  valor: number,
): Promise<{ clientSecret: string | null; mock: boolean }> {
  const stripeKey = import.meta.env.VITE_STRIPE_SECRET_KEY
  if (!stripeKey) {
    return { clientSecret: null, mock: true }
  }

  // TODO: chamar Stripe API
  // const stripe = new Stripe(stripeKey)
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(valor * 100),
  //   currency: "brl",
  //   metadata: { pedido_id: pedidoId },
  // })
  //
  // await supabase
  //   .from("catalogo_pagamentos")
  //   .update({ stripe_payment_intent_id: paymentIntent.id })
  //   .eq("pedido_id", pedidoId)
  //
  // return { clientSecret: paymentIntent.client_secret, mock: false }

  throw new Error("Stripe não configurado — defina VITE_STRIPE_SECRET_KEY")
}

/**
 * Confirma PaymentIntent recebido via webhook.
 */
export async function confirmarPaymentIntent(
  paymentIntentId: string,
): Promise<void> {
  // TODO: buscar payment intent no Stripe, verificar status,
  // chamar confirmarPagamento do pagamentos.service
}

/**
 * Processa webhook do Stripe (eventos: payment_intent.succeeded, etc).
 */
export async function handleStripeWebhook(
  _payload: string,
  _signature: string,
): Promise<{ received: boolean }> {
  // TODO: validar assinatura com webhook secret
  // extrair event type, processar conforme tipo
  return { received: true }
}
