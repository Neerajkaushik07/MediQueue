import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create a transporter for sending emails
// Create a transporter for sending emails
const createTransporter = () => {
    // Check if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const isEthereal = process.env.EMAIL_USER.includes('ethereal.email');

        const host = isEthereal ? 'smtp.ethereal.email' : (process.env.EMAIL_HOST || 'smtp.gmail.com');
        const port = parseInt(process.env.EMAIL_PORT) || 587;

        logger.info(`Connecting to SMTP: ${host}:${port} (Ethereal: ${isEthereal})`);

        return nodemailer.createTransport({
            host: host,
            port: port,
            secure: port === 465, // Use SSL for port 465, STARTTLS for others
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            connectionTimeout: 10000, // 10 seconds timeout
            greetingTimeout: 10000
        });
    }
    logger.warn("⚠️ EMAIL DASHBOARD: Credentials missing. Emails will be logged to console instead of sent.");
    return null;
};

const transporter = createTransporter();

// Debug logs for email configuration
logger.debug("Email Service Configuration:");
logger.debug(`EMAIL_USER set: ${!!process.env.EMAIL_USER}`);
logger.debug(`EMAIL_PASSWORD set: ${!!process.env.EMAIL_PASSWORD}`);


// Send appointment booking confirmation email
export const sendBookingConfirmation = async (userEmail, userName, doctorName, slotDate, slotTime) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Appointment Booking Confirmation - MediQueue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5f6FFF;">Appointment Confirmed!</h2>
                    <p>Dear ${userName},</p>
                    <p>Your appointment has been successfully booked.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    <p>Please arrive 10 minutes before your scheduled appointment time.</p>
                    <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>MediQueue Team</strong></p>
                </div>
            `
        };

        if (!transporter) {
            logger.info(`[MOCK EMAIL] To: ${userEmail}, Subject: Appointment Booking Confirmation`);
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
    }
};

// Send appointment cancellation email
export const sendCancellationEmail = async (userEmail, userName, doctorName, slotDate, slotTime) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Appointment Cancellation - MediQueue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff5555;">Appointment Cancelled</h2>
                    <p>Dear ${userName},</p>
                    <p>Your appointment has been cancelled.</p>
                    <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff5555;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    <p>If you'd like to book another appointment, please visit our website.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>MediQueue Team</strong></p>
                </div>
            `
        };

        if (!transporter) {
            logger.info(`[MOCK EMAIL] To: ${userEmail}, Subject: Appointment Cancellation`);
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
    }
};

// Send appointment reminder email (to be scheduled 24 hours before)
export const sendAppointmentReminder = async (userEmail, userName, doctorName, slotDate, slotTime) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Appointment Reminder - MediQueue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5f6FFF;">Appointment Reminder</h2>
                    <p>Dear ${userName},</p>
                    <p>This is a friendly reminder about your upcoming appointment.</p>
                    <div style="background-color: #f0f4ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #5f6FFF;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    <p>Please remember to arrive 10 minutes early.</p>
                    <p>If you need to cancel or reschedule, please do so as soon as possible.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>MediQueue Team</strong></p>
                </div>
            `
        };

        if (!transporter) {
            logger.info(`[MOCK EMAIL] To: ${userEmail}, Subject: Appointment Reminder`);
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
    }
};

// Send appointment completion email
export const sendCompletionEmail = async (userEmail, userName, doctorName, slotDate, slotTime) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Appointment Completed - MediQueue',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">Appointment Completed</h2>
                    <p>Dear ${userName},</p>
                    <p>Your appointment has been marked as completed.</p>
                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
                        <p><strong>Doctor:</strong> ${doctorName}</p>
                        <p><strong>Date:</strong> ${slotDate}</p>
                        <p><strong>Time:</strong> ${slotTime}</p>
                    </div>
                    <p>We hope you had a great experience!</p>
                    <p>Please take a moment to leave a review for Dr. ${doctorName}.</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>MediQueue Team</strong></p>
                </div>
            `
        };

        if (!transporter) {
            logger.info(`[MOCK EMAIL] To: ${userEmail}, Subject: Appointment Completed`);
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
    }
};

// Send newsletter subscription email
export const sendSubscriptionEmail = async (userEmail) => {
    // Function to send subscription welcome email
    try {
        logger.info(`Attempting to send subscription email to: ${userEmail}`);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to MediQueue Newsletter',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5f6FFF;">Welcome to MediQueue!</h2>
                    <p>Thank you for subscribing to our newsletter.</p>
                    <p>You will now receive:</p>
                    <ul>
                        <li>Expert health advice</li>
                        <li>Wellness tips</li>
                        <li>Latest medical updates</li>
                    </ul>
                    <p>Stay healthy!</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>MediQueue Team</strong></p>
                </div>
            `
        };

        if (!transporter) {
            logger.info(`[MOCK EMAIL] To: ${userEmail}, Subject: Welcome to MediQueue Newsletter`);
            logger.debug(`MOCK EMAIL CONTENT: ${mailOptions.html}`);
            return;
        }

        logger.info(`Sending email via ${process.env.EMAIL_HOST || 'default host'}...`);
        const info = await transporter.sendMail(mailOptions);
        logger.info('✅ Email sent successfully!');
        logger.debug(`Response: ${info.response}`);
        logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
        logger.error('❌ Error sending subscription email:');
        logger.error(`Code: ${error.code}`);
        logger.error(`Response: ${error.response}`);
        logger.error(`Full Error: ${error}`);
    }
};

