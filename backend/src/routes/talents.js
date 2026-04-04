// backend/src/routes/talents.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET /api/talents — liste avec filtres optionnels
router.get('/', async (req, res) => {
  const { category, zone, boosted } = req.query;

  const where = {};
  if (category) where.category = category.toUpperCase();
  if (zone) where.zoneGeo = { contains: zone, mode: 'insensitive' };
  if (boosted === 'true') {
    where.isBoosted = true;
    where.boostExpiresAt = { gt: new Date() };
  }

  const talents = await prisma.talentProfile.findMany({
    where,
    include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    orderBy: [{ isBoosted: 'desc' }, { createdAt: 'desc' }],
  });

  res.json(talents);
});

// GET /api/talents/:id
router.get('/:id', async (req, res) => {
  const talent = await prisma.talentProfile.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
  });
  if (!talent) return res.status(404).json({ error: 'Talent introuvable' });
  res.json(talent);
});

// POST /api/talents — créer son profil talent
router.post('/', requireAuth, async (req, res) => {
  const { category, bio, zoneGeo, youtubeUrl, instruments } = req.body;
  if (!category || !zoneGeo) {
    return res.status(400).json({ error: 'category et zoneGeo requis' });
  }

  const existing = await prisma.talentProfile.findUnique({ where: { userId: req.user.id } });
  if (existing) return res.status(409).json({ error: 'Profil talent déjà existant' });

  const talent = await prisma.talentProfile.create({
    data: {
      userId: req.user.id,
      category: category.toUpperCase(),
      bio,
      zoneGeo,
      youtubeUrl,
      instruments: instruments || [],
    },
  });

  await prisma.user.update({ where: { id: req.user.id }, data: { role: 'MUSICIEN' } });
  res.status(201).json(talent);
});

// PATCH /api/talents/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const talent = await prisma.talentProfile.findUnique({ where: { id: req.params.id } });
  if (!talent) return res.status(404).json({ error: 'Talent introuvable' });
  if (talent.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  const { bio, zoneGeo, youtubeUrl, instruments } = req.body;
  const updated = await prisma.talentProfile.update({
    where: { id: req.params.id },
    data: { bio, zoneGeo, youtubeUrl, instruments },
  });
  res.json(updated);
});

// POST /api/talents/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  const talent = await prisma.talentProfile.update({
    where: { id: req.params.id },
    data: { likesCount: { increment: 1 } },
    select: { likesCount: true },
  });
  res.json(talent);
});

module.exports = router;
