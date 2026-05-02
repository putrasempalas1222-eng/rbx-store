const axios = require('axios');

module.exports = async (req, res) => {
    // 1. Mengatur header agar bisa diakses oleh frontend Anda (CORS Policy)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Menangani preflight request browser
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: "Username harus diisi" });
    }

    try {
        // 2. Menembak API Roblox Search
        const robloxRes = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: {
                keyword: username,
                limit: 1
            }
        });

        const users = robloxRes.data.data;

        // 3. Logika pengecekan: Apakah user ditemukan dan namanya pas?
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

        res.status(200).json({ success: false, message: "Username Roblox tidak ditemukan." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Roblox sedang sibuk." });
    }
};