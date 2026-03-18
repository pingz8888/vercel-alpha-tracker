export default async function handler(req, res) {
    const APP_KEY = process.env.APP_PASSWORD;
    if (req.headers['x-app-key'] !== APP_KEY) return res.status(401).json({ error: "Unauthorized" });
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `You are a veteran Singaporean hedge fund manager with 30 years experience in investments and a solid track record in generating millions of dollars from stocks investments. Recommend THREE 6-month swing trades (SGX listed). 
    
    Format:
    ★ [Ticker] | [Company]
    Thesis: [2-sentence technical setup].
    Levels: Entry @ [Price] | Stop @ [Price] | Target @ [Price].`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return res.status(200).json({ recommendations: data.candidates[0].content.parts[0].text });
    } catch (error) { return res.status(500).json({ error: "Vercel Timeout" }); }
}
