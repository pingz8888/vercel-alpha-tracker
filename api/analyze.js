import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (req.headers['x-app-password'] !== process.env.APP_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { setupData, type } = req.body;
        
        const systemPrompt = type === 'alpha' 
            ? "Analyze setup. Output exactly 2 short bullet points. Highly actionable. No filler."
            : "Keep/sell analysis. Exactly 1 short sentence verdict, 1 short sentence rationale.";

        const result = await model.generateContent(`${systemPrompt}\n\nData: ${JSON.stringify(setupData)}`);
        res.status(200).json({ analysis: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI analysis timed out or failed.' });
    }
}
