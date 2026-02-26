// Email utility for sending OTPs
// In production, integrate with services like SendGrid, AWS SES, or Nodemailer

export const sendOTPEmail = async (
    email: string,
    otp: string,
    purpose: 'registration' | 'password_reset'
): Promise<void> => {
    // For development: Just log the OTP
    console.log(`
╔════════════════════════════════════════════╗
║          OTP EMAIL NOTIFICATION            ║
╚════════════════════════════════════════════╝

To: ${email}
Purpose: ${purpose === 'registration' ? 'Account Registration' : 'Password Reset'}

Your OTP Code: ${otp}

This code will expire in 10 minutes.

Do not share this code with anyone.

╚════════════════════════════════════════════╝
    `);

    // TODO: In production, implement actual email sending
    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'Aarogya AI <noreply@aarogya.app>',
        to: email,
        subject: purpose === 'registration' ? 'Verify Your Email' : 'Reset Your Password',
        html: `
            <h2>Your OTP Code</h2>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
    */
};
