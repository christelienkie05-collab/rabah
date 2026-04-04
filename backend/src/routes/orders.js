// backend/src/routes/orders.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { processOrder, updateTracking } = require('../orders/service');

// POST /api/orders — créer une commande (après paiement Stripe confirmé)
router.post('/', requireAuth, async (req, res) => {
  const { productId, shippingAddress } = req.body;
  if (!productId || !shippingAddress) {
    return res.status(400).json({ error: 'productId et shippingAddress requis' });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  if (!product.inStock) return res.status(409).json({ error: 'Produit hors stock' });

  const ourMargin = product.ourPrice - product.sourcePrice;

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      productId,
      totalPaid: product.ourPrice,
      supplierCost: product.sourcePrice,
      ourMargin,
      shippingAddress,
      status: 'PAID',
    },
  });

  // Transmettre à Make.com (Thomann)
  await processOrder(order.id);

  res.status(201).json(order);
});

// GET /api/orders/mine
router.get('/mine', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { product: { select: { name: true, imageUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { product: true },
  });
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }
  res.json(order);
});

// POST /api/orders/:id/tracking — webhook Make.com retour
router.post('/:id/tracking', async (req, res) => {
  const { trackingNumber, secret } = req.body;
  if (secret !== process.env.LEVITLINK_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Secret invalide' });
  }
  if (!trackingNumber) return res.status(400).json({ error: 'trackingNumber requis' });

  await updateTracking(req.params.id, trackingNumber);
  res.json({ success: true });
});

module.exports = router;
