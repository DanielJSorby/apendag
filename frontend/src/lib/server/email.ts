/**
 * Email sending utility
 * 
 * Setup instructions:
 * 1. Install Resend: npm install resend
 * 2. Get API key from https://resend.com (free tier: 100 emails/day)
 * 3. Add to .env: RESEND_API_KEY=re_xxxxx
 * 4. Add to .env: FROM_EMAIL=noreply@yourdomain.com (or use Resend's test domain)
 * 
 * For nodemailer (waitlist emails):
 * 1. Install nodemailer: npm install nodemailer
 * 2. Add to .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
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
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // If Resend is not configured, handle differently in dev vs production
    if (!resendInstance) {
        const errorMessage = 'RESEND_API_KEY not set in environment variables. Cannot send email.';
        console.error('[EMAIL ERROR]', errorMessage);
        
        // In development, log the link but warn
        if (isDevelopment) {
            console.log(`[DEV MODE] Magic link for ${to}: ${magicLink}`);
            console.log('To enable email sending, set RESEND_API_KEY in your .env file');
            return; // Allow dev mode to continue
        }
        
        // In production, throw error to prevent silent failures
        throw new Error(errorMessage);
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

/**
 * Send waitlist notification email using nodemailer
 * Notifies user when they get a spot from the waitlist
 */
export async function sendWaitlistNotificationEmail(
    to: string, 
    userName: string, 
    kursNavn: string, 
    tidspunktTekst: string
): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
        // Dynamic import to avoid errors if package not installed
        const nodemailerModule = await import('nodemailer');
        const nodemailer = nodemailerModule.default || nodemailerModule;
        
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        
        if (!smtpHost || !smtpUser || !smtpPass) {
            const errorMessage = 'SMTP configuration not set in environment variables. Cannot send waitlist email.';
            console.error('[EMAIL ERROR]', errorMessage);
            
            if (isDevelopment) {
                console.log(`[DEV MODE] Would send waitlist notification to ${to} for ${kursNavn} at ${tidspunktTekst}`);
                console.log('To enable email sending, set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file');
                return; // Allow dev mode to continue
            }
            
            throw new Error(errorMessage);
        }
        
        // Konfigurer transporter med støtte for STARTTLS (viktig for Domeneshop)
        // Prøv både LOGIN og PLAIN autentisering
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            // For STARTTLS (port 587), må vi eksplisitt aktivere det
            requireTLS: smtpPort === 587,
            tls: {
                // Ikke avvis ugyldige sertifikater i development (kan være nødvendig for noen servere)
                rejectUnauthorized: !isDevelopment
            },
            // Legg til debug i development
            debug: isDevelopment,
            logger: isDevelopment
        });
        
        // For Domeneshop: FROM_EMAIL må være på samme domene som SMTP_USER
        let fromEmail = process.env.FROM_EMAIL;
        
        // Hvis SMTP_USER er en e-postadresse, sjekk og korriger FROM_EMAIL
        if (smtpUser.includes('@')) {
            const smtpDomain = smtpUser.split('@')[1];
            
            // Hvis FROM_EMAIL ikke er satt, bruk SMTP_USER
            if (!fromEmail) {
                fromEmail = smtpUser;
                console.log(`[EMAIL] FROM_EMAIL ikke satt, bruker SMTP_USER: ${fromEmail}`);
            } 
            // Hvis FROM_EMAIL er satt men på feil domene, bruk SMTP_USER i stedet
            else if (fromEmail.includes('@')) {
                const fromDomain = fromEmail.split('@')[1];
                if (smtpDomain !== fromDomain) {
                    console.warn(
                        `[EMAIL] FROM_EMAIL (${fromEmail}) er ikke på samme domene som SMTP_USER (${smtpUser}). ` +
                        `Bruker SMTP_USER som FROM_EMAIL i stedet.`
                    );
                    fromEmail = smtpUser;
                }
            }
        } else {
            // Hvis SMTP_USER er et brukernavn (wildcard-konto), må FROM_EMAIL være satt eksplisitt
            if (!fromEmail) {
                throw new Error(
                    'FROM_EMAIL må være satt i .env når SMTP_USER er et brukernavn. ' +
                    'For wildcard-kontoer, sett FROM_EMAIL til en e-postadresse på domenet (f.eks. noreply@elvebakkenapendag.no)'
                );
            }
        }
        
        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
        
        const mailOptions = {
            from: fromEmail,
            to: to,
            subject: 'Du har fått plass på kurset! - Elvebakken',
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
                            background-color: #4CAF50; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            margin: 20px 0;
                        }
                        .info-box {
                            background-color: #f0f7ff;
                            border-left: 4px solid #1d40b0;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Gratulerer! Du har fått plass på kurset</h2>
                        <p>Hei${userName ? ` ${userName}` : ''},</p>
                        <p>Vi har gode nyheter! Det har blitt ledig en plass på kurset du stod på venteliste for.</p>
                        <div class="info-box">
                            <p><strong>Kurs:</strong> ${kursNavn}</p>
                        </div>
                        <p>Du er nå automatisk påmeldt kurset. Du kan se din påmelding når du logger inn på nettsiden.</p>
                        <a href="${baseUrl}/kalender22" class="button">Se min påmelding</a>
                        <p>Hvis du ikke lenger ønsker å delta, kan du melde deg av via nettsiden.</p>
                        <div class="footer">
                            <p>Hvis du har spørsmål, ta kontakt med oss.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Gratulerer! Du har fått plass på kurset
                
                Hei${userName ? ` ${userName}` : ''},
                
                Vi har gode nyheter! Det har blitt ledig en plass på kurset du stod på venteliste for.
                
                Kurs: ${kursNavn}
                Tidspunkt: ${tidspunktTekst}
                
                Du er nå automatisk påmeldt kurset. Du kan se din påmelding når du logger inn på nettsiden: ${baseUrl}/kalender22
                
                Hvis du ikke lenger ønsker å delta, kan du melde deg av via nettsiden.
                
                Hvis du har spørsmål, ta kontakt med oss.
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Waitlist notification email sent successfully to', to, 'Message ID:', info.messageId);
        return;
    } catch (error: any) {
        console.error('Failed to send waitlist notification email:', error);
        
        // Gi mer detaljert feilmelding basert på feilkoden
        if (error.code === 'EAUTH') {
            const authError = new Error(
                'SMTP autentisering feilet. Sjekk at SMTP_USER og SMTP_PASS er korrekte. ' +
                'For Gmail, bruk App Password i stedet for vanlig passord. ' +
                `Feil: ${error.response || error.message}`
            );
            authError.name = 'SMTPAuthError';
            throw authError;
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            const connError = new Error(
                `Kunne ikke koble til SMTP-serveren (${smtpHost}:${smtpPort}). ` +
                `Sjekk at SMTP_HOST og SMTP_PORT er korrekte. Feil: ${error.message}`
            );
            connError.name = 'SMTPConnectionError';
            throw connError;
        }
        
        throw error;
    }
}

