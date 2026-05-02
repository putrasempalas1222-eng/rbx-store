const axios = require('axios');

module.exports = async (req, res) => {
    // Header CORS agar Dashboard bisa mengakses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { username } = req.query;

    if (!username) {
        return res.status(200).json({ success: false, message: "Username kosong." });
    }

    try {
        // Menggunakan API pencarian Roblox
        const response = await axios.get(`https://users.roblox.com/v1/users/search`, {
            params: { keyword: username, limit: 1 },
            timeout: 5000 // Menghindari request menggantung
        });

        const users = response.data.data;

        if (users && users.length > 0) {
            // Verifikasi kecocokan nama secara tepat
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
        let errorMsg = "Gagal memverifikasi akun.";
        
        if (error.response) {
            // Jika Roblox memblokir karena terlalu banyak request (429)
            if (error.response.status === 429) {
                errorMsg = "Roblox sedang limit. Coba lagi dalam 1 menit.";
            } else {
                errorMsg = `Kesalahan server Roblox (${error.response.status}).`;
            }
        } else if (error.request) {
            errorMsg = "Koneksi ke Roblox terputus.";
        }

        return res.status(200).json({ success: false, message: errorMsg });
    }
};
