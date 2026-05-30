// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendSecurityAlertEmail = async (toEmail, subject, textContent) => {
  try {
    const mailOptions = {
      from: `"Smart Home" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #dc2626;">⚠️ Alerte de Sécurité !</h2>
          <p style="font-size: 14px; color: #374151;">${textContent}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
          <p style="font-size: 11px; color: #9ca3af;">Cet e-mail a été envoyé automatiquement par votre système SmartHome Management.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Émail d'alerte envoyé avec succès à: ${toEmail}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'émail:", error.message);
  }
};