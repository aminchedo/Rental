const { sendContractSignedEmail, testEmailConnection } = require('./emailService');
const { 
    sendContractSignedNotification: sendTelegramNotification, 
    testConnection: testTelegramConnection 
} = require('./telegramService');
const { 
    sendContractSignedNotification: sendWhatsAppNotification, 
    testConnection: testWhatsAppConnection 
} = require('./whatsappService');

class NotificationController {
    constructor() {
        this.services = {
            email: {
                enabled: process.env.EMAIL_ENABLED !== 'false',
                sendContractSigned: sendContractSignedEmail,
                testConnection: testEmailConnection
            },
            telegram: {
                enabled: process.env.TELEGRAM_ENABLED === 'true',
                sendContractSigned: sendTelegramNotification,
                testConnection: testTelegramConnection
            },
            whatsapp: {
                enabled: process.env.WHATSAPP_ENABLED === 'true',
                sendContractSigned: sendWhatsAppNotification,
                testConnection: testWhatsAppConnection
            }
        };
    }

    async sendContractSignedNotifications(contractData) {
        const { landlordEmail, landlordName, tenantName, contractNumber, landlordPhone } = contractData;
        const results = {};

        // Send email notification
        if (this.services.email.enabled && landlordEmail) {
            try {
                results.email = await this.services.email.sendContractSigned(
                    landlordEmail, landlordName, tenantName, contractNumber
                );
            } catch (error) {
                results.email = { success: false, error: error.message };
            }
        }

        // Send Telegram notification
        if (this.services.telegram.enabled) {
            try {
                results.telegram = await this.services.telegram.sendContractSigned(
                    landlordName, tenantName, contractNumber
                );
            } catch (error) {
                results.telegram = { success: false, error: error.message };
            }
        }

        // Send WhatsApp notification
        if (this.services.whatsapp.enabled && landlordPhone) {
            try {
                results.whatsapp = await this.services.whatsapp.sendContractSigned(
                    landlordPhone, landlordName, tenantName, contractNumber
                );
            } catch (error) {
                results.whatsapp = { success: false, error: error.message };
            }
        }

        // Log overall results
        const successCount = Object.values(results).filter(r => r.success).length;
        const totalEnabled = Object.values(this.services).filter(s => s.enabled).length;
        
        console.log(`Notifications sent: ${successCount}/${totalEnabled} services successful`);
        
        return {
            success: successCount > 0,
            results,
            summary: {
                total: totalEnabled,
                successful: successCount,
                failed: totalEnabled - successCount
            }
        };
    }

    async testAllConnections() {
        const results = {};

        for (const [serviceName, service] of Object.entries(this.services)) {
            if (service.enabled) {
                try {
                    results[serviceName] = await service.testConnection();
                } catch (error) {
                    results[serviceName] = { success: false, error: error.message };
                }
            } else {
                results[serviceName] = { success: false, error: 'Service disabled' };
            }
        }

        return results;
    }

    async testServiceConnection(serviceName) {
        if (!this.services[serviceName]) {
            return { success: false, error: 'Service not found' };
        }

        const service = this.services[serviceName];
        if (!service.enabled) {
            return { success: false, error: 'Service disabled' };
        }

        try {
            return await service.testConnection();
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getServiceStatus() {
        const status = {};
        
        for (const [serviceName, service] of Object.entries(this.services)) {
            status[serviceName] = {
                enabled: service.enabled,
                configured: this.isServiceConfigured(serviceName)
            };
        }

        return status;
    }

    isServiceConfigured(serviceName) {
        switch (serviceName) {
            case 'email':
                return !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
            case 'telegram':
                return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
            case 'whatsapp':
                return !!(process.env.WHATSAPP_ACCOUNT_SID && process.env.WHATSAPP_AUTH_TOKEN && process.env.WHATSAPP_NUMBER);
            default:
                return false;
        }
    }

    async sendExpenseNotification(expenseData) {
        const { amount, description, category, date, contractNumber } = expenseData;
        
        const message = `💰 هزینه جدید ثبت شد

📊 جزئیات هزینه:
• مبلغ: ${amount.toLocaleString('fa-IR')} تومان
• شرح: ${description}
• دسته‌بندی: ${category}
• تاریخ: ${date}
• قرارداد: ${contractNumber || 'عمومی'}

📅 تاریخ ثبت: ${new Date().toLocaleDateString('fa-IR')}`;

        const results = {};

        // Send to enabled services
        if (this.services.telegram.enabled) {
            results.telegram = await this.services.telegram.sendContractSigned('', '', '', '').catch(() => 
                ({ success: false, error: 'Service error' })
            );
        }

        return results;
    }
}

// Create singleton instance
const notificationController = new NotificationController();

module.exports = notificationController;