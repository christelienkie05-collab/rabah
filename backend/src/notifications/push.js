// backend/src/notifications/push.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

/**
 * Envoie une notification push via Firebase Cloud Messaging
 * Utilisé pour : SOS Urgence, paiements, expéditions, messages
 */
async function sendPush({ token, title, body, data = {} }) {
  if (!token) return { skipped: true, reason: 'no_fcm_token' };

  try {
    const res = await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'lyra-music_main' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    });
    return { success: true, messageId: res };
  } catch (err) {
    console.error('[Push] Erreur envoi:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * SOS Urgence — notifie TOUS les talents d'une catégorie dans une zone
 */
async function sendSosAlert({ prisma, category, zoneGeo, announcementId, message }) {
  const talents = await prisma.talentProfile.findMany({
    where: {
      category: category.toUpperCase(),
      zoneGeo: { contains: zoneGeo, mode: 'insensitive' },
      user: { fcmToken: { not: null } },
    },
    include: { user: true },
  });

  const results = await Promise.allSettled(
    talents.map(t =>
      sendPush({
        token: t.user.fcmToken,
        title: '🚨 SOS Urgence — Mission disponible',
        body: message || `Besoin urgent d'un ${category} — ${zoneGeo}`,
        data: { type: 'SOS_URGENT', announcementId },
      })
    )
  );

  return { notified: talents.length, results };
}

module.exports = { sendPush, sendSosAlert };
