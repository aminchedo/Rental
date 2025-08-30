const axios = require('axios');
require('dotenv').config();

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID;
        this.enabled = process.env.TELEGRAM_ENABLED === 'true';
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    async sendContractSignedNotification(landlordName, tenantName, contractNumber) {
        if (!this.enabled || !this.botToken || !this.chatId) {
            console.log('Telegram service is disabled or not configured');
            return { success: false, error: 'Service not configured' };
        }

        try {
            const message = this.formatContractSignedMessage(landlordName, tenantName, contractNumber);
            
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });

            console.log('Telegram notification sent successfully:', response.data.message_id);
            return { success: true, messageId: response.data.message_id };
        } catch (error) {
            console.error('Error sending Telegram notification:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.description || error.message };
        }
    }

    formatContractSignedMessage(landlordName, tenantName, contractNumber) {
        const currentDate = new Date().toLocaleDateString('fa-IR');
        
        return `🎉 <b>قرارداد اجاره امضا شد</b>

📋 <b>جزئیات قرارداد:</b>
• شماره قرارداد: <code>${contractNumber}</code>
• نام موجر: ${landlordName}
• نام مستأجر: ${tenantName}
• تاریخ امضا: ${currentDate}

✅ <b>قرارداد با موفقیت توسط مستأجر امضا شد.</b>

می‌توانید از طریق پنل مدیریت خود، جزئیات کامل قرارداد را مشاهده کنید.

🤖 این پیام به صورت خودکار ارسال شده است.`;
    }

    async sendCustomNotification(message, parseMode = 'HTML') {
        if (!this.enabled || !this.botToken || !this.chatId) {
            console.log('Telegram service is disabled or not configured');
            return { success: false, error: 'Service not configured' };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.chatId,
                text: message,
                parse_mode: parseMode
            });

            console.log('Telegram custom notification sent successfully:', response.data.message_id);
            return { success: true, messageId: response.data.message_id };
        } catch (error) {
            console.error('Error sending Telegram custom notification:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.description || error.message };
        }
    }

    async testConnection() {
        if (!this.botToken) {
            return { success: false, error: 'Bot token not configured' };
        }

        try {
            const response = await axios.get(`${this.baseUrl}/getMe`);
            
            if (response.data.ok) {
                console.log('Telegram bot connection successful:', response.data.result.username);
                return { 
                    success: true, 
                    botInfo: response.data.result,
                    message: `ربات ${response.data.result.first_name} آماده است`
                };
            } else {
                return { success: false, error: 'Invalid bot response' };
            }
        } catch (error) {
            console.error('Telegram connection test failed:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.description || error.message };
        }
    }

    async getChatInfo() {
        if (!this.enabled || !this.botToken || !this.chatId) {
            return { success: false, error: 'Service not configured' };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/getChat`, {
                chat_id: this.chatId
            });

            if (response.data.ok) {
                return { success: true, chatInfo: response.data.result };
            } else {
                return { success: false, error: 'Invalid chat response' };
            }
        } catch (error) {
            console.error('Error getting chat info:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.description || error.message };
        }
    }
}

// Create singleton instance
const telegramService = new TelegramService();

module.exports = {
    sendContractSignedNotification: (landlordName, tenantName, contractNumber) => 
        telegramService.sendContractSignedNotification(landlordName, tenantName, contractNumber),
    sendCustomNotification: (message, parseMode) => 
        telegramService.sendCustomNotification(message, parseMode),
    testConnection: () => telegramService.testConnection(),
    getChatInfo: () => telegramService.getChatInfo()
};