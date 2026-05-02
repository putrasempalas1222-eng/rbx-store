const axios = require('axios');

module.exports = async (req, res) => {
    // Header agar domain apapun bisa mengakses (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { username } = req.query;

    try {
        // Menembak langsung ke API Users Roblox
        const response = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: { keyword: username, limit: 1 },
            timeout: 5000 // Timeout 5 detik
        });

        const users = response.data.data;

        if (users && users.length > 0) {
            const match = users.find(u => u.name.toLowerCase() === username.toLowerCase());
            if (match) {
                return res.status(200).json({ 
                    success: true, 
                    userId: match.id,
                    displayName: match.displayName 
                });
            }
        }

        return res.status(200).json({ success: false, message: "Username tidak ditemukan." });

    } catch (error) {
        // Jika API Roblox memberikan status 429 (Too Many Requests)
        const isLimit = error.response && error.response.status === 429;
        return res.status(200).json({ 
            success: false, 
            message: isLimit ? "Roblox sedang limit, coba lagi dalam 1 menit." : "Gagal memverifikasi akun." 
        });
    }
};
