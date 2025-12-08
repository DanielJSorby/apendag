/**
 * Email sending utility
 * 
 * Setup instructions:
 * 1. Install Resend: npm install resend
 * 2. Get API key from https://resend.com (free tier: 100 emails/day)
 * 3. Add to .env: RESEND_API_KEY=re_xxxxx
 * 4. Add to .env: FROM_EMAIL=noreply@yourdomain.com (or use Resend's test domain)
 */

let resend: any = null;

// Lazy initialization of Resend
async function getResend() {
    if (!resend) {
        try {
            // Dynamic import to avoid errors if package not installed
            const { Resend } = await import('resend');
            const apiKey = process.env.RESEND_API_KEY;
            
            if (!apiKey) {
                console.warn('RESEND_API_KEY not set in environment variables');
                return null;
            }
            
            resend = new Resend(apiKey);
        } catch (error) {
            console.warn('Resend package not installed. Run: npm install resend');
            return null;
        }
    }
    return resend;
}

export async function sendMagicLinkEmail(to: string, magicLink: string, userName?: string): Promise<void> {
    const resendInstance = await getResend();
    
    // If Resend is not configured, log and continue (for development)
    if (!resendInstance) {
        console.log(`[DEV MODE] Magic link for ${to}: ${magicLink}`);
        console.log('To enable email sending, install Resend: npm install resend');
        return;
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Resend's test domain
    
    try {
        const { data, error } = await resendInstance.emails.send({
            from: fromEmail,
            to: [to],
            subject: 'Your Magic Login Link - Elvebakken',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .button { 
                            display: inline-block; 
                            padding: 12px 24px; 
                            background-color: #1d40b0; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            margin: 20px 0;
                        }
                        .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Magic Login Link</h2>
                        <p>Hello${userName ? ` ${userName}` : ''},</p>
                        <p>Click the button below to log in to your account:</p>
                        <a href="${magicLink}" class="button">Log In</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #1d40b0;">${magicLink}</p>
                        <p><strong>This link expires in 15 minutes.</strong></p>
                        <div class="footer">
                            <p>If you didn't request this link, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Magic Login Link
                
                Hello${userName ? ` ${userName}` : ''},
                
                Click this link to log in: ${magicLink}
                
                This link expires in 15 minutes.
                
                If you didn't request this link, please ignore this email.
            `
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        console.log('Magic link email sent successfully to', to);
        return;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

