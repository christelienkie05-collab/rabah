// backend/src/routes/webhooks.js
// Stripe webhooks — raw body requis (bodyParser désactivé pour cette route)

const router = require('express').Router();
const Stripe = require('stripe');
const prisma = require('../lib/prisma');
const { processOrder } = require('../orders/service');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.amount_capturable_updated': {
      // Escrow créé avec succès — paiement autorisé mais pas encore capturé
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'ESCROW', stripeIntentId: pi.id },
        });
      }
      break;
    }

    case 'checkout.session.completed': {
      // Paiement boutique confirmé — créer la commande
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await processOrder(orderId).catch(console.error);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' },
        });
      }
      break;
    }

    default:
      // Ignorer les événements non gérés
      break;
  }

  res.json({ received: true });
});

module.exports = router;
