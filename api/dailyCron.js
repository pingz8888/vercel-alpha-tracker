import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const prompt = `Recommend TWO swing trades (US/SGX). Format: [Ticker] | Target: [Price]. 1 sentence setup.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const aiText = (await response.json()).candidates[0].content.parts[0].text;

        // Telegram
        if (process.env.TELEGRAM_BOT_TOKEN) {
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `📈 ALPHA BRIEF:\n\n${aiText}` })
            });
        }

        // Email
        if (process.env.EMAIL_USER) {
            const trans = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
            await trans.sendMail({ from: '"Alpha v3"', to: process.env.EMAIL_USER, subject: 'Daily Alpha Brief', text: aiText });
        }

        return res.status(200).send("Dispatched");
    } catch (error) { return res.status(500).send("Failed"); }
}
