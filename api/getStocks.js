export default async function handler(req, res) {
    const APP_KEY = process.env.APP_PASSWORD;
    if (req.headers['x-app-key'] !== APP_KEY) return res.status(401).json({ error: "Unauthorized" });

    const symbols = (req.query.symbols || "").split(',');
    const results = {};

    try {
        await Promise.all(symbols.map(async (symbol) => {
            const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbol}&range=1d&interval=5m&indicators=close&includeTimestamps=false&includePrePost=false`;
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await response.json();
            const meta = data.spark?.result?.[0]?.response?.[0]?.meta;
            if (meta?.regularMarketPrice) {
                results[symbol] = { price: meta.regularMarketPrice.toFixed(2), name: meta.longName || symbol };
            }
        }));
        return res.status(200).json(results);
    } catch (error) { return res.status(500).json({ error: error.message }); }
}
