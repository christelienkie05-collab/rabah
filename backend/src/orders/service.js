// backend/src/orders/service.js
// Transmission automatique des commandes à Thomann via Make.com

const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../notifications/email');
const { sendPush } = require('../notifications/push');

const prisma = new PrismaClient();

/**
 * Appelé après confirmation du paiement Stripe (webhook)
 * Transmet la commande à Make.com qui exécute l'achat Thomann
 */
async function processOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
      user: true,
    },
  });

  if (!order) throw new Error(`Order ${orderId} introuvable`);
  if (order.status !== 'PAID') throw new Error('Commande non payée');

  const payload = {
    // Infos produit pour Thomann
    thomann_ref: order.product.thomannRef,
    product_name: order.product.name,
    quantity: 1,

    // Coordonnées livraison client
    shipping: order.shippingAddress,

    // Montant à payer à Thomann (prix source)
    amount_to_supplier: order.supplierCost,

    // Référence interne
    "lyra-music_order_id": order.id,
    customer_email: order.user.email,
  };

  // POST vers webhook Make.com → scénario dropshipping
  const res = await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Make.com webhook failed: ${err}`);
  }

  // Mise à jour statut
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'FORWARDED',
      forwardedAt: new Date(),
    },
  });

  // Email confirmation client
  await sendEmail({
    to: order.user.email,
    subject: `📦 Commande confirmée — ${order.product.name}`,
    html: `
      <h2>Merci pour votre commande, ${order.user.name} !</h2>
      <p>Votre <strong>${order.product.name}</strong> est en cours de préparation.</p>
      <p>Vous recevrez un email de suivi dès l'expédition.</p>
      <hr>
      <p style="color:#666;font-size:13px">Commande Lyra Music #${order.id}</p>
    `,
  });

  // Push notification
  await sendPush({
    token: order.user.fcmToken,
    title: 'Commande en route 📦',
    body: `${order.product.name} — expédition en cours`,
    data: { type: 'ORDER_UPDATE', orderId: order.id },
  });

  return { success: true, orderId, forwardedAt: new Date() };
}

/**
 * Mise à jour du numéro de suivi (appelé par webhook Thomann/Make.com retour)
 */
async function updateTracking(lyraOrderId, trackingNumber) {
  const order = await prisma.order.update({
    where: { id: lyraOrderId },
    data: { status: 'SHIPPED', trackingNumber },
    include: { user: true, product: true },
  });

  await sendEmail({
    to: order.user.email,
    subject: `🚚 Votre ${order.product.name} est expédié !`,
    html: `
      <h2>Votre commande est en chemin !</h2>
      <p>Numéro de suivi : <strong>${trackingNumber}</strong></p>
    `,
  });

  await sendPush({
    token: order.user.fcmToken,
    title: 'Expédié ! 🚚',
    body: `Suivi : ${trackingNumber}`,
    data: { type: 'ORDER_SHIPPED', orderId: order.id, trackingNumber },
  });
}

module.exports = { processOrder, updateTracking };
