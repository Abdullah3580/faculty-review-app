// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// ১. ভেরিফিকেশন ইমেইল ফাংশন (আগেরটি)
export const sendVerificationEmail = async (email: string, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const confirmLink = `${baseUrl}/verify-email?token=${token}`;

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
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
           For security reasons, this link will expire in <strong>15 minutes</strong>.
        </p>
      </div>
    `,
  });
};

// ২. পাসওয়ার্ড রিসেট ইমেইল ফাংশন (নতুন যোগ করা হলো) ✅
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your Password - Faculty Review",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Someone requested a password reset for your account. If this was you, click the link below to set a new password:</p>
        
        <div style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p>Or copy this link:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't ask for this, simply ignore this email.</p>
      </div>
    `,
  });
};