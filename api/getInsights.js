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
        const systemPrompt = "Provide keep/sell analysis. Output exactly 1 short sentence for the verdict, and 1 short sentence for the rationale. Be highly direct. No filler words.";

        const result = await model.generateContent(`${systemPrompt}\n\nData: ${JSON.stringify(setupData)}`);
        res.status(200).json({ analysis: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Insight generation timed out or failed.' });
    }
}
