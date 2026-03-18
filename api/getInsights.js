export default async function handler(req, res) {
    const APP_KEY = process.env.APP_PASSWORD;
    if (req.headers['x-app-key'] !== APP_KEY) return res.status(401).json({ error: "Unauthorized" });
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const { ticker } = req.body;
    
    const prompt = `Hedge fund brief for ${ticker}. Signal: [KEEP/SELL/WATCH]. Setup: 1 short sentence. Levels: Target: [Price] | Stop: [Price]. Max 30 words.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            try {
                // Parse chunks and extract text
                const parts = chunk.split('}\n{').map((p, i, a) => {
                    let s = p;
                    if (i !== 0) s = '{' + s;
                    if (i !== a.length - 1) s = s + '}';
                    return JSON.parse(s);
                });

                parts.forEach(p => {
                    const text = p.candidates[0].content.parts[0].text;
                    if (text) res.write(text);
                });
            } catch (e) {
                // Pass on partial chunks
            }
        }
        res.end();
    } catch (error) {
        res.status(500).end("Error");
    }
}
