const axios = require('axios');

module.exports = async (req, res) => {
    // Header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. Ambil username & bersihkan spasi di awal/akhir
    const rawUsername = req.query.username || "";
    const username = rawUsername.trim();

    if (!username) {
        return res.status(200).json({ success: false, message: "Username tidak boleh kosong." });
    }

    try {
        // 2. Gunakan URL resmi dengan encode yang ketat
        // Limit 1 sudah cukup untuk pengecekan keberadaan
        const targetUrl = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`;
        
        const response = await axios.get(targetUrl, {
            timeout: 6000,
            headers: { 'Accept': 'application/json' }
        });

        const users = response.data.data;

        // 3. Logika Verifikasi
        if (users && users.length > 0) {
            // Pastikan hasil pencarian pertama benar-benar sama namanya (Case Insensitive)
            const isMatch = users[0].name.toLowerCase() === username.toLowerCase();
            
            if (isMatch) {
                return res.status(200).json({ 
                    success: true, 
                    userId: users[0].id,
                    displayName: users[0].displayName 
                });
            }
        }

        return res.status(200).json({ success: false, message: "Username tidak terdaftar di Roblox." });

    } catch (error) {
        let statusCode = error.response ? error.response.status : "CONN_ERR";
        let msg = "Gagal memverifikasi akun.";

        if (statusCode === 400) msg = "Format username tidak valid bagi Roblox.";
        if (statusCode === 429) msg = "Sistem sedang limit, coba lagi nanti.";

        return res.status(200).json({ 
            success: false, 
            message: `${msg} (${statusCode})` 
        });
    }
};
