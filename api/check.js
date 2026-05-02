const axios = require('axios');

module.exports = async (req, res) => {
    // Header CORS agar Dashboard rbx-putrastore.vercel.app bisa mengakses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Mengambil username dan membersihkan spasi (trim)
    const rawUsername = req.query.username || "";
    const username = rawUsername.trim();

    if (!username) {
        return res.status(200).json({ success: false, message: "Username tidak boleh kosong." });
    }

    try {
        // PERBAIKAN UTAMA: Menggunakan encodeURIComponent untuk mencegah Error 400
        const robloxApiUrl = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`;
        
        const response = await axios.get(robloxApiUrl, {
            timeout: 5000 // Menghindari request menggantung
        });

        const users = response.data.data;

        if (users && users.length > 0) {
            // Verifikasi kecocokan nama secara case-insensitive
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
        // Deteksi spesifik error untuk debugging
        let statusCode = error.response ? error.response.status : "Unknown";
        let errMsg = "Gagal memverifikasi akun.";

        if (statusCode === 400) {
            errMsg = "Format username ilegal atau tidak didukung.";
        } else if (statusCode === 429) {
            errMsg = "Terlalu banyak permintaan, coba lagi nanti.";
        }

        return res.status(200).json({ 
            success: false, 
            message: `${errMsg} (${statusCode})` 
        });
    }
};
