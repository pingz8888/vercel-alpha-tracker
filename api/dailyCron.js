import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
        return res.status(401).json({ error: 'Unauthorized cron execution' });
    }

    try {
        const briefingText = "Alpha v4 Briefing: Market data pending. Systems online.";
        
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: briefingText })
        });

        const mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
        });

        await mailTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: 'Alpha v4 Terminal - Daily Briefing',
            text: briefingText
        });

        res.status(200).json({ success: true, message: 'Briefing dispatched.' });
    } catch (error) {
        console.error('Cron failed:', error);
        res.status(500).json({ error: 'Briefing dispatch failed.' });
    }
}
