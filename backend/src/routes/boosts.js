// backend/src/routes/boosts.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const BOOST_PRICES = {
  weekly: { amount: 5, days: 7 },
  monthly: { amount: 15, days: 30 },
};

// POST /api/boosts — activer un boost (après paiement Stripe)
router.post('/', requireAuth, async (req, res) => {
  const { plan } = req.body; // 'weekly' | 'monthly'
  if (!BOOST_PRICES[plan]) {
    return res.status(400).json({ error: 'plan doit être "weekly" ou "monthly"' });
  }

  const talent = await prisma.talentProfile.findUnique({ where: { userId: req.user.id } });
  if (!talent) return res.status(404).json({ error: 'Profil talent introuvable' });

  const { amount, days } = BOOST_PRICES[plan];
  const startsAt = new Date();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const [boost] = await prisma.$transaction([
    prisma.boost.create({
      data: { talentId: talent.id, amountPaid: amount, startsAt, expiresAt },
    }),
    prisma.talentProfile.update({
      where: { id: talent.id },
      data: { isBoosted: true, boostExpiresAt: expiresAt },
    }),
  ]);

  res.status(201).json({ boost, expiresAt });
});

module.exports = router;
