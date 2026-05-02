const axios = require('axios');

module.exports = async (req, res) => {
    // Header agar Dashboard kamu bisa memanggil API ini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: "Username kosong" });
    }

    try {
        // Mencari user di Roblox
        const response = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: { keyword: username, limit: 1 }
        });

        const users = response.data.data;

        if (users && users.length > 0) {
            // Pastikan nama benar-benar sama (case-insensitive)
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
        return res.status(200).json({ success: false, message: "Sistem Roblox sedang limit/sibuk." });
    }
};
