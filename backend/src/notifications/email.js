// backend/src/notifications/email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@lyra-music.app',
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[Email] Erreur:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
