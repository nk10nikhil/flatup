import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to FlatUp!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to FlatUp!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining FlatUp, the premier platform for flat listings and rentals.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse thousands of flat listings</li>
          <li>Connect with property owners and brokers</li>
          <li>List your own properties (with subscription)</li>
        </ul>
        <p>Get started by exploring our platform!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Explore FlatUp</a>
        <p>Best regards,<br>The FlatUp Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: number
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Subscription Confirmed - FlatUp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Subscription Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your subscription has been successfully activated!</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Subscription Details:</h3>
          <p><strong>Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</p>
          <p><strong>Amount:</strong> ₹${amount / 100}</p>
          <p><strong>Duration:</strong> 1 Month</p>
        </div>
        <p>You can now start listing your properties and reach thousands of potential tenants!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        <p>Best regards,<br>The FlatUp Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInquiryNotificationEmail(
  to: string,
  listerName: string,
  flatTitle: string,
  visitorName: string,
  visitorEmail: string,
  visitorPhone: string,
  message: string
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `New Inquiry for ${flatTitle} - FlatUp`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Inquiry Received!</h1>
        <p>Hi ${listerName},</p>
        <p>You have received a new inquiry for your property listing: <strong>${flatTitle}</strong></p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Inquiry Details:</h3>
          <p><strong>Name:</strong> ${visitorName}</p>
          <p><strong>Email:</strong> ${visitorEmail}</p>
          <p><strong>Phone:</strong> ${visitorPhone}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: white; padding: 10px; border-radius: 4px;">${message}</p>
        </div>
        <p>Please respond to the inquiry as soon as possible to increase your chances of finding a tenant.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Dashboard</a>
        <p>Best regards,<br>The FlatUp Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
