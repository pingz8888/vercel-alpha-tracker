// Master Key - In production, replace this with a secure UI input mechanism
const MASTER_KEY = 'YOUR_LOCAL_TESTING_KEY'; 

async function loadStocks(ticker) {
    const response = await fetch(`/api/getStocks?ticker=${ticker}`, {
        headers: { 'x-app-password': MASTER_KEY }
    });
    return await response.json();
}

async function loadInsights(data) {
    const response = await fetch('/api/getInsights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-app-password': MASTER_KEY
        },
        body: JSON.stringify({ setupData: data })
    });
    return await response.json();
}

async function loadRecommendations(data) {
    const response = await fetch('/api/getRecommendations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-app-password': MASTER_KEY
        },
        body: JSON.stringify({ setupData: data })
    });
    return await response.json();
}

// Example usage on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('status-output').innerText = 'System Online. Ready to fetch.';
});
