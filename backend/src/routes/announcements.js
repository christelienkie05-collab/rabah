// backend/src/routes/announcements.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { sendSosAlert } = require('../notifications/push');

// GET /api/announcements
router.get('/', async (req, res) => {
  const { eventType, sos, status } = req.query;
  const where = {};
  if (eventType) where.eventType = eventType.toUpperCase();
  if (sos === 'true') where.isSosUrgent = true;
  if (status) where.status = status;

  const announcements = await prisma.announcement.findMany({
    where,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: [{ isSosUrgent: 'desc' }, { createdAt: 'desc' }],
  });
  res.json(announcements);
});

// GET /api/announcements/:id
router.get('/:id', async (req, res) => {
  const ann = await prisma.announcement.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      bookings: {
        include: { talent: { include: { user: { select: { name: true, avatarUrl: true } } } } },
      },
    },
  });
  if (!ann) return res.status(404).json({ error: 'Annonce introuvable' });
  res.json(ann);
});

// POST /api/announcements
router.post('/', requireAuth, async (req, res) => {
  const { title, eventType, eventDate, location, budgetPerMusician, instrumentsNeeded, description, isSosUrgent } = req.body;
  if (!title || !eventType || !eventDate || !location) {
    return res.status(400).json({ error: 'title, eventType, eventDate et location requis' });
  }

  const ann = await prisma.announcement.create({
    data: {
      userId: req.user.id,
      title,
      eventType: eventType.toUpperCase(),
      eventDate: new Date(eventDate),
      location,
      budgetPerMusician: budgetPerMusician ? parseFloat(budgetPerMusician) : null,
      instrumentsNeeded: instrumentsNeeded || [],
      description,
      isSosUrgent: Boolean(isSosUrgent),
    },
  });

  // Déclencher les alertes SOS si urgent
  if (isSosUrgent && instrumentsNeeded?.length) {
    for (const category of instrumentsNeeded) {
      sendSosAlert({ prisma, category, zoneGeo: location, announcementId: ann.id }).catch(console.error);
    }
  }

  res.status(201).json(ann);
});

// PATCH /api/announcements/:id/close
router.patch('/:id/close', requireAuth, async (req, res) => {
  const ann = await prisma.announcement.findUnique({ where: { id: req.params.id } });
  if (!ann) return res.status(404).json({ error: 'Annonce introuvable' });
  if (ann.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }
  const updated = await prisma.announcement.update({
    where: { id: req.params.id },
    data: { status: 'closed' },
  });
  res.json(updated);
});

// DELETE /api/announcements/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const ann = await prisma.announcement.findUnique({ where: { id: req.params.id } });
  if (!ann) return res.status(404).json({ error: 'Annonce introuvable' });
  if (ann.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
