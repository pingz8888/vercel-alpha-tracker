import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (req.headers['x-app-password'] !== process.env.APP_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { setupData } = req.body;
        const systemPrompt = "Analyze this setup to find alpha. Output strictly 2 brief bullet points. Extremely concise. Actionable only. Zero filler.";

        const result = await model.generateContent(`${systemPrompt}\n\nData: ${JSON.stringify(setupData)}`);
        res.status(200).json({ recommendations: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Recommendation generation timed out or failed.' });
    }
}
