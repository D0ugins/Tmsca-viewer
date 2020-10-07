const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No authentication token provided" });
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ msg: "Authentication failed" });

            req.user = decoded.id;
            next()
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

}

module.exports = auth