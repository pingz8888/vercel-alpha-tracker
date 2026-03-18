export default async function handler(req, res) {
    if (req.headers['x-app-password'] !== process.env.APP_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { ticker } = req.query;
        const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${ticker}`);
        const data = await response.json();
        
        // Edge caching to protect Hobby tier limits
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
}
