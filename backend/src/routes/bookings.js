// backend/src/routes/bookings.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { createEscrow, releaseEscrow, openDispute } = require('../escrow/service');

// POST /api/bookings — créer une réservation + séquestre
router.post('/', requireAuth, async (req, res) => {
  const { announcementId, talentId, amount } = req.body;
  if (!announcementId || !talentId || !amount) {
    return res.status(400).json({ error: 'announcementId, talentId et amount requis' });
  }

  const ann = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!ann) return res.status(404).json({ error: 'Annonce introuvable' });
  if (ann.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

  const platformFee = parseFloat((amount * 0.10).toFixed(2));
  const talentPayout = parseFloat((amount - platformFee).toFixed(2));

  const booking = await prisma.booking.create({
    data: {
      announcementId,
      talentId,
      amount: parseFloat(amount),
      platformFee,
      talentPayout,
      status: 'PENDING',
    },
  });

  // Créer le séquestre Stripe si le customer Stripe ID est disponible
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  let clientSecret = null;
  if (user.stripeCustomerId) {
    clientSecret = await createEscrow(booking.id, amount, user.stripeCustomerId);
  }

  res.status(201).json({ booking, clientSecret });
});

// GET /api/bookings/mine — réservations de l'utilisateur connecté
router.get('/mine', requireAuth, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { announcement: { userId: req.user.id } },
        { talent: { userId: req.user.id } },
      ],
    },
    include: {
      announcement: { select: { title: true, eventDate: true, location: true } },
      talent: { include: { user: { select: { name: true, avatarUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
});

// POST /api/bookings/:id/release — libérer le séquestre
router.post('/:id/release', requireAuth, async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { announcement: true },
  });
  if (!booking) return res.status(404).json({ error: 'Booking introuvable' });
  if (booking.announcement.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  const result = await releaseEscrow(req.params.id, req.user.id);
  res.json(result);
});

// POST /api/bookings/:id/dispute — ouvrir un litige
router.post('/:id/dispute', requireAuth, async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'reason requis' });

  await openDispute(req.params.id, reason, req.user.email);
  res.json({ success: true });
});

module.exports = router;
