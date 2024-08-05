import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.join(__dirname, "..", "config", ".env"),
});

interface EmailOptions {
  to: string;
  username: string;
  verificationToken: string;
}

async function sendAccountCreationEmail({
  to,
  username,
  verificationToken,
}: EmailOptions): Promise<void> {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
  });

  const verificationLink = `${process.env.FRONTEND_URL}/account/verify-email?token=${verificationToken}`;

  let mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: "Welcome to FoodHub - Verify Your Email",
    text: `Hello ${username},

Welcome to FoodHub! We're excited to have you join our community of food enthusiasts.

Your account has been created, but we need to verify your email address. Please click on the link below to verify your email:

${verificationLink}

If you didn't create an account with FoodHub, please ignore this email.

Once your email is verified, you can start exploring our wide range of culinary delights, share your favorite recipes, and connect with other food lovers.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Bon appétit!

The FoodHub Team`,

    html: `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #FFFFFF; border: 2px solid #FF6347; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; font-size: 28px; color: #FF6347; margin-bottom: 20px;">Welcome to FoodHub, ${username}!</h2>
      <p style="font-size: 18px; color: #333333; text-align: left;">We're excited to have you join our community of food enthusiasts.</p>
      <p style="font-size: 18px; color: #333333; text-align: left;">Your account has been created, but we need to verify your email address. Please click the button below to verify your email:</p>
      <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
        <a href="${verificationLink}" style="background-color: #FF6347; color: white; padding: 14px 28px; text-decoration: none; font-size: 18px; border-radius: 5px;">Verify Your Email</a>
      </div>
      <p style="font-size: 16px; color: #666666; text-align: left;">If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: #0000FF; text-align: left;">${verificationLink}</p>
      <p style="font-size: 16px; color: #666666; text-align: left;">If you didn't create an account with FoodHub, please ignore this email.</p>
      <p style="font-size: 18px; color: #333333; text-align: left;">Once your email is verified, you can start exploring our wide range of culinary delights, share your favorite recipes, and connect with other food lovers.</p>
      <p style="font-size: 18px; color: #333333; text-align: left;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p style="text-align: center; margin-top: 30px; color: #FF6347; font-size: 20px;">Bon appétit!</p>
      <p style="text-align: center; color: #333333; font-size: 16px;">The FoodHub Team</p>
    </div>
    `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (err) {
    console.error("Error occurred while sending verification email:", err);
    throw err;
  }
}

export default sendAccountCreationEmail;
