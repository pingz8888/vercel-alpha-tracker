export default async function handler(req, res) {
    const APP_KEY = process.env.APP_PASSWORD;
    if (req.headers['x-app-key'] !== APP_KEY) return res.status(401).json({ error: "Unauthorized" });
    const { ticker } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `You are a veteran Singaporean institutional investor wirh 30 years of experience in investment, with a proven record in earning millions from stocks investments. Analyze this watchlist for 6-month, 20% upside: ${tickers.join(', ')}. 
    
    For each stock, provide:
    TICKER: [SIGNAL] - Analysis (2 meaningful sentences). Target: [Price] | Stop: [Price]
    
    Use [KEEP], [SELL], or [WATCH]. Focus on technical momentum. No intro.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return res.status(200).json({ insight: data.candidates[0].content.parts[0].text });
    } catch (error) { return res.status(500).json({ error: "AI Busy" }); }
}
