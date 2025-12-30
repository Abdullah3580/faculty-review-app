import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { userEmail, userName, subject, message } = await req.json();

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVER_USER,    
        pass: process.env.EMAIL_SERVER_PASSWORD, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER, 
      to: process.env.EMAIL_SERVER_USER,   
      replyTo: userEmail,                  
      subject: `[Faculty App Support] ${subject} - from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4F46E5;">New Message Received</h2>
          <p><strong>User:</strong> ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
  }
}