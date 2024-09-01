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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FoodHub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; text-align: center; background-color: #FF6347; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to FoodHub</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Hello ${username},</p>
                  <p style="font-size: 16px; color: #666666; line-height: 1.5; margin-bottom: 20px;">We're thrilled to have you join our community of food enthusiasts! Your account has been created, but we need to verify your email address to get you started.</p>
                  <table role="presentation" style="margin: 30px auto;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #FF6347;">
                        <a href="${verificationLink}" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-size: 18px;">Verify Your Email</a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 14px; color: #999999; margin-bottom: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="font-size: 14px; color: #0066cc; margin-bottom: 20px;">${verificationLink}</p>
                  <p style="font-size: 16px; color: #666666; line-height: 1.5; margin-bottom: 20px;">Once verified, you can start exploring our wide range of culinary delights, share your favorite recipes, and connect with other food lovers.</p>
                  <p style="font-size: 16px; color: #666666; line-height: 1.5;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; text-align: center; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 16px; color: #999999;">Bon appétit!</p>
                  <p style="margin: 10px 0 0; font-size: 16px; color: #999999;">The FoodHub Team</p>
                  <table role="presentation" style="margin-top: 20px;">
                    <tr>
                      <td style="padding: 0 10px;">
                        <a href="#" style="color: #999999; font-size: 20px;">📘</a>
                      </td>
                      <td style="padding: 0 10px;">
                        <a href="#" style="color: #999999; font-size: 20px;">📸</a>
                      </td>
                      <td style="padding: 0 10px;">
                        <a href="#" style="color: #999999; font-size: 20px;">🐦</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
