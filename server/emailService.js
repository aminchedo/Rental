const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

const sendContractSignedEmail = async (landlordEmail, landlordName, tenantName, contractNumber) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: landlordEmail,
            subject: `قرارداد اجاره شماره ${contractNumber} امضا شد`,
            html: `
                <div dir="rtl" style="font-family: 'Tahoma', sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">
                            🎉 قرارداد اجاره امضا شد
                        </h2>
                        
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #1e40af; margin-bottom: 15px;">جزئیات قرارداد:</h3>
                            <p><strong>شماره قرارداد:</strong> ${contractNumber}</p>
                            <p><strong>نام موجر:</strong> ${landlordName}</p>
                            <p><strong>نام مستأجر:</strong> ${tenantName}</p>
                            <p><strong>تاریخ امضا:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
                        </div>
                        
                        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-right: 4px solid #10b981;">
                            <p style="margin: 0; color: #065f46;">
                                <strong>✅ قرارداد با موفقیت توسط مستأجر امضا شد.</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #065f46; font-size: 14px;">
                                می‌توانید از طریق پنل مدیریت خود، جزئیات کامل قرارداد را مشاهده کنید.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px;">
                                این ایمیل به صورت خودکار ارسال شده است.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Test email configuration
const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email service is ready');
        return true;
    } catch (error) {
        console.error('Email service configuration error:', error);
        return false;
    }
};

module.exports = { 
    sendContractSignedEmail,
    testEmailConnection
};