// backend/src/escrow/service.js
// Gestion du séquestre Stripe pour les prestations musicales

const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../notifications/email');
const { sendPush } = require('../notifications/push');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

const PLATFORM_COMMISSION = 0.10; // 10%

/**
 * 1. Créer un Payment Intent en mode "manual capture" (= séquestre)
 *    L'argent est prélevé mais pas encore versé au talent
 */
async function createEscrow(bookingId, amountEuros, customerStripeId) {
  const amountCents = Math.round(amountEuros * 100);
  const platformFee = Math.round(amountCents * PLATFORM_COMMISSION);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'eur',
    customer: customerStripeId,
    capture_method: 'manual',          // ← clé du séquestre
    application_fee_amount: platformFee,
    transfer_data: {
      destination: await getTalentStripeAccount(bookingId),
    },
    metadata: { bookingId, type: 'escrow' },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'ESCROW',
      stripeIntentId: paymentIntent.id,
      platformFee: platformFee / 100,
      talentPayout: (amountCents - platformFee) / 100,
    },
  });

  return paymentIntent.client_secret;
}

/**
 * 2. Libérer le séquestre après confirmation de l'événement
 *    Appelé par l'annonceur depuis l'app ou automatiquement 48h après l'événement
 */
async function releaseEscrow(bookingId, confirmedBy = 'annonceur') {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      announcement: { include: { user: true } },
      talent: { include: { user: true } },
    },
  });

  if (!booking || booking.status !== 'ESCROW') {
    throw new Error('Booking introuvable ou non en séquestre');
  }

  // Capture = prélèvement réel + virement automatique au talent
  await stripe.paymentIntents.capture(booking.stripeIntentId);

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'COMPLETED',
      escrowReleasedAt: new Date(),
    },
  });

  // Notifications
  await sendEmail({
    to: booking.talent.user.email,
    subject: '💰 Paiement reçu — Lyra Music',
    html: `<p>Bonjour ${booking.talent.user.name},<br>
      Votre prestation a été confirmée. <strong>${booking.talentPayout}€</strong> 
      ont été virés sur votre compte Stripe.</p>`,
  });

  await sendPush({
    token: booking.talent.user.fcmToken,
    title: 'Paiement reçu 🎉',
    body: `${booking.talentPayout}€ virés — prestation confirmée`,
    data: { type: 'PAYOUT', bookingId },
  });

  return { success: true, talentPayout: booking.talentPayout };
}

/**
 * 3. Ouvrir un litige
 */
async function openDispute(bookingId, reason, disputedBy) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'DISPUTED', disputeReason: reason },
  });

  // Notifier l'admin
  await sendEmail({
    to: 'levitiquepianoschool@gmail.com',
    subject: `⚠️ Litige ouvert — Booking ${bookingId}`,
    html: `<p>Litige signalé par <strong>${disputedBy}</strong>.<br>
      Raison : ${reason}<br>
      Booking ID : ${bookingId}</p>`,
  });
}

/**
 * 4. Auto-release 48h après l'événement si pas de litige
 *    → Appelé par un cron job (voir /src/jobs/autoRelease.js)
 */
async function autoReleaseExpiredEscrows() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const readyBookings = await prisma.booking.findMany({
    where: {
      status: 'ESCROW',
      announcement: { eventDate: { lt: twoDaysAgo } },
    },
  });

  const results = await Promise.allSettled(
    readyBookings.map(b => releaseEscrow(b.id, 'auto'))
  );

  return results;
}

async function getTalentStripeAccount(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { talent: true },
  });
  return booking.talent.stripeAccountId;
}

module.exports = { createEscrow, releaseEscrow, openDispute, autoReleaseExpiredEscrows };
