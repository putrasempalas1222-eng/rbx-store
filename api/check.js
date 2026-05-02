const axios = require('axios');

module.exports = async (req, res) => {
    // Pengaturan CORS agar Dashboard bisa mengakses API ini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: "Username tidak boleh kosong." });
    }

    try {
        // Melakukan pencarian user ke API resmi Roblox
        const response = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: { keyword: username, limit: 1 },
            timeout: 5000 // Batas waktu 5 detik agar tidak menggantung
        });

        const users = response.data.data;

        if (users && users.length > 0) {
            // Validasi apakah nama benar-benar cocok (mencegah salah sasaran)
            const match = users.find(u => u.name.toLowerCase() === username.toLowerCase());
            if (match) {
                return res.status(200).json({ 
                    success: true, 
                    userId: match.id,
                    displayName: match.displayName 
                });
            }
        }

        return res.status(200).json({ success: false, message: "Username tidak terdaftar di Roblox." });

    } catch (error) {
        // Jika terkena Rate Limit (Error 429) atau server Roblox bermasalah
        console.error("Roblox API Error:", error.message);
        return res.status(200).json({ 
            success: false, 
            message: "Sistem verifikasi sedang limit. Tunggu beberapa saat lagi." 
        });
    }
};
