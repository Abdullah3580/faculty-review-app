import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  // ভেরিফিকেশন লিংক তৈরি
  // যেমন: http://localhost:3000/verify-email?token=abcd-1234
  const confirmLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your Faculty Review Account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Welcome to Faculty Review!</h2>
        <p>Thanks for signing up. Please click the link below to verify your university email address:</p>
        
        <div style="margin: 20px 0;">
          <a href="${confirmLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${confirmLink}">${confirmLink}</a></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
      </div>
    `,
  });
};