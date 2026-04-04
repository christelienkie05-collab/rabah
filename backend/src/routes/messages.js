// backend/src/routes/messages.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET /api/messages/threads — liste des conversations
router.get('/threads', requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Dédupliquer par conversation (paire senderId/receiverId)
  const seen = new Set();
  const threads = messages.filter(m => {
    const key = [m.senderId, m.receiverId].sort().join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  res.json(threads);
});

// GET /api/messages/:userId — messages avec un utilisateur
router.get('/:userId', requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Marquer comme lus les messages reçus
  await prisma.message.updateMany({
    where: { senderId: req.params.userId, receiverId: req.user.id, isRead: false },
    data: { isRead: true },
  });

  res.json(messages);
});

// POST /api/messages — envoyer un message
router.post('/', requireAuth, async (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'receiverId et content requis' });
  }
  if (receiverId === req.user.id) {
    return res.status(400).json({ error: 'Impossible de vous envoyer un message à vous-même' });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return res.status(404).json({ error: 'Destinataire introuvable' });

  const message = await prisma.message.create({
    data: { senderId: req.user.id, receiverId, content },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  res.status(201).json(message);
});

// GET /api/messages/unread/count
router.get('/unread/count', requireAuth, async (req, res) => {
  const count = await prisma.message.count({
    where: { receiverId: req.user.id, isRead: false },
  });
  res.json({ count });
});

module.exports = router;
