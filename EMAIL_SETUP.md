# Email Configuration Setup

## Required Email Settings

To enable email notifications when contracts are signed, you need to configure the email settings in the `/server/.env` file.

### Gmail Configuration (Recommended)

1. **Update the `.env` file** with your Gmail credentials:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   ```

2. **Generate an App Password** (for Gmail):
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Generate an "App Password" for this application
   - Use the generated password in the `EMAIL_PASS` field

### Other Email Providers

For other email providers, update the SMTP settings accordingly:

- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Use your provider's SMTP settings

### Testing Email Configuration

The server will automatically test the email configuration on startup. Check the server logs for any email service errors.

### Email Features

- **Automatic Notifications**: When a tenant signs a contract, an email is automatically sent to the landlord
- **Persian Email Template**: The email is formatted in Persian with proper RTL layout
- **Graceful Failure**: If email sending fails, the contract signing process still completes successfully

### Security Note

- Never commit your actual email credentials to version control
- Use environment variables for all sensitive configuration
- Consider using dedicated email services for production environments