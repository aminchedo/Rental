const twilio = require('twilio');
require('dotenv').config();

class WhatsAppService {
    constructor() {
        this.accountSid = process.env.WHATSAPP_ACCOUNT_SID;
        this.authToken = process.env.WHATSAPP_AUTH_TOKEN;
        this.whatsappNumber = process.env.WHATSAPP_NUMBER;
        this.enabled = process.env.WHATSAPP_ENABLED === 'true';
        
        if (this.accountSid && this.authToken) {
            this.client = twilio(this.accountSid, this.authToken);
        }
    }

    async sendContractSignedNotification(landlordPhone, landlordName, tenantName, contractNumber) {
        if (!this.enabled || !this.client || !this.whatsappNumber) {
            console.log('WhatsApp service is disabled or not configured');
            return { success: false, error: 'Service not configured' };
        }

        // Ensure phone number format is correct for WhatsApp
        const formattedPhone = this.formatPhoneNumber(landlordPhone);
        if (!formattedPhone) {
            return { success: false, error: 'Invalid phone number format' };
        }

        try {
            const message = this.formatContractSignedMessage(landlordName, tenantName, contractNumber);
            
            const response = await this.client.messages.create({
                from: `whatsapp:${this.whatsappNumber}`,
                to: `whatsapp:${formattedPhone}`,
                body: message
            });

            console.log('WhatsApp notification sent successfully:', response.sid);
            return { success: true, messageId: response.sid, status: response.status };
        } catch (error) {
            console.error('Error sending WhatsApp notification:', error);
            return { success: false, error: error.message };
        }
    }

    formatContractSignedMessage(landlordName, tenantName, contractNumber) {
        const currentDate = new Date().toLocaleDateString('fa-IR');
        
        return `🎉 *قرارداد اجاره امضا شد*

📋 *جزئیات قرارداد:*
• شماره قرارداد: ${contractNumber}
• نام موجر: ${landlordName}
• نام مستأجر: ${tenantName}
• تاریخ امضا: ${currentDate}

✅ *قرارداد با موفقیت توسط مستأجر امضا شد.*

می‌توانید از طریق پنل مدیریت خود، جزئیات کامل قرارداد را مشاهده کنید.

🤖 این پیام به صورت خودکار ارسال شده است.`;
    }

    formatPhoneNumber(phone) {
        if (!phone) return null;
        
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Handle Iranian phone numbers
        if (cleaned.startsWith('98')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+98${cleaned.substring(1)}`;
        } else if (cleaned.length === 10) {
            return `+98${cleaned}`;
        } else if (cleaned.startsWith('9') && cleaned.length === 9) {
            return `+98${cleaned}`;
        }
        
        // For international numbers, assume they're already formatted correctly
        if (cleaned.length > 10) {
            return `+${cleaned}`;
        }
        
        return null;
    }

    async sendCustomNotification(phone, message) {
        if (!this.enabled || !this.client || !this.whatsappNumber) {
            console.log('WhatsApp service is disabled or not configured');
            return { success: false, error: 'Service not configured' };
        }

        const formattedPhone = this.formatPhoneNumber(phone);
        if (!formattedPhone) {
            return { success: false, error: 'Invalid phone number format' };
        }

        try {
            const response = await this.client.messages.create({
                from: `whatsapp:${this.whatsappNumber}`,
                to: `whatsapp:${formattedPhone}`,
                body: message
            });

            console.log('WhatsApp custom notification sent successfully:', response.sid);
            return { success: true, messageId: response.sid, status: response.status };
        } catch (error) {
            console.error('Error sending WhatsApp custom notification:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        if (!this.accountSid || !this.authToken) {
            return { success: false, error: 'Credentials not configured' };
        }

        if (!this.client) {
            return { success: false, error: 'Twilio client not initialized' };
        }

        try {
            // Test by fetching account information
            const account = await this.client.api.accounts(this.accountSid).fetch();
            
            console.log('WhatsApp service connection successful:', account.friendlyName);
            return { 
                success: true, 
                accountInfo: {
                    friendlyName: account.friendlyName,
                    status: account.status
                },
                message: `اتصال WhatsApp برقرار است - ${account.friendlyName}`
            };
        } catch (error) {
            console.error('WhatsApp connection test failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getMessageStatus(messageSid) {
        if (!this.enabled || !this.client) {
            return { success: false, error: 'Service not configured' };
        }

        try {
            const message = await this.client.messages(messageSid).fetch();
            return { 
                success: true, 
                status: message.status,
                dateCreated: message.dateCreated,
                dateSent: message.dateSent,
                dateUpdated: message.dateUpdated
            };
        } catch (error) {
            console.error('Error fetching message status:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const whatsappService = new WhatsAppService();

module.exports = {
    sendContractSignedNotification: (landlordPhone, landlordName, tenantName, contractNumber) => 
        whatsappService.sendContractSignedNotification(landlordPhone, landlordName, tenantName, contractNumber),
    sendCustomNotification: (phone, message) => 
        whatsappService.sendCustomNotification(phone, message),
    testConnection: () => whatsappService.testConnection(),
    getMessageStatus: (messageSid) => whatsappService.getMessageStatus(messageSid),
    formatPhoneNumber: (phone) => whatsappService.formatPhoneNumber(phone)
};