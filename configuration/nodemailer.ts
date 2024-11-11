const nodemailer = require("nodemailer");
const GOOGLE_CODE_APP = process.env.GOOGLE_CODE_APP;
const EMAIL = process.env.EMAIL;
const URL_RESET_PASSWORD=process.env.URL_RESET_PASSWORD
const transporteur = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: GOOGLE_CODE_APP,
  },
});

const mailContent = (content:{toEmail:string,subject:string,text:string}) => {
    
  return {
    from: EMAIL,
    to: content.toEmail,
    subject: content.subject,
    text: content.text,
  };
};
exports.sendConfirmationCode = (email:string, code:string) => {
  return new Promise((resolve, reject) => {
    transporteur.sendMail(
      mailContent({
        toEmail: email,
        subject: "code de confirmation",
        text: "Votre code est : " + code,
      }),
      (error:Error, info:string) => {
        resolve(!error || !!info);
      }
    );
  });
};
exports.sendNewPassword = (email:string, token:string) => {
  return new Promise((resolve, reject) => {
    transporteur.sendMail(
      mailContent({
        toEmail: email,
        subject: "Lien de réinitialisation de mot de passe",
        text: "Le lien de réinitialisation de mot de passe est : "+URL_RESET_PASSWORD + token,
      }),
      (error:Error, info:string) => {
        resolve(!error || !!info);
      }
    );
  });
};


export const sendTicketToClient = async (
  email: string,
  message: {
    match: {
      matchTitle?: string,
      matchDescription?: string,
      matchStadiumName?: string,
      matchCompetition?: string,
      matchDate?: string,
      matchHour?: string,
    },
    price?: string,
    seatNumber?: string,
    qrcode: string
  }
) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GOOGLE_CODE_APP,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    attachDataUrls: true,
    subject: `Votre Billet pour le Match - ${message.match.matchTitle}`,
    html: `
          <html>
            <body>
              <h2>Cher(e) Supporter,</h2>
              <p>Nous sommes ravis de vous confirmer votre réservation pour le match suivant :</p>
              <h3>Détails du Match :</h3>
              <ul>
                <li><strong>Titre :</strong> ${message.match.matchTitle}</li>
                <li><strong>Description :</strong> ${message.match.matchDescription}</li>
                <li><strong>Stade :</strong> ${message.match.matchStadiumName}</li>
                <li><strong>Compétition :</strong> ${message.match.matchCompetition}</li>
                <li><strong>Date :</strong> ${message.match.matchDate}</li>
                <li><strong>Heure :</strong> ${message.match.matchHour}</li>
                <li><strong>Prix :</strong> ${message.price} DZD</li>
                <li><strong>Numéro de siège :</strong> ${message.seatNumber}</li>
              </ul>
              <p>Veuillez trouver votre QR code ci-dessous. Ce code est nécessaire pour accéder au stade le jour du match. Assurez-vous de le présenter à l'entrée.</p>
              <img src="${message.qrcode}" alt="QR Code du billet" style="width: 200px; height: 200px;"/>
              <p>Merci pour votre confiance ! Nous espérons que vous passerez un excellent moment. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              <p>Sportivement,<br>L'équipe d'organisation</p>
            </body>
          </html>
        `,
  };

  await transporter.sendMail(mailOptions);
};