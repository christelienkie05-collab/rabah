// backend/src/routes/cron.js
// Endpoints appelés par Vercel Cron Jobs (remplace node-cron)
// Sécurisés par CRON_SECRET

const router = require('express').Router();
const prisma = require('../lib/prisma');
const { autoReleaseExpiredEscrows } = require('../escrow/service');

function verifyCronSecret(req, res, next) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

// GET /api/cron/release-escrow — libère les escrows expirés (48h post-événement)
// Planifié toutes les heures via vercel.json
router.get('/release-escrow', verifyCronSecret, async (req, res) => {
  const results = await autoReleaseExpiredEscrows();
  const released = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  res.json({ released, failed, total: results.length });
});

// GET /api/cron/expire-boosts — désactive les boosts expirés
router.get('/expire-boosts', verifyCronSecret, async (req, res) => {
  const expired = await prisma.talentProfile.updateMany({
    where: { isBoosted: true, boostExpiresAt: { lt: new Date() } },
    data: { isBoosted: false },
  });
  res.json({ expired: expired.count });
});

module.exports = router;
