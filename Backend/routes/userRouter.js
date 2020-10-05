const router = require("express").Router();
const bycrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const User = require("../models/userModel")
const auth = require('../middleware/auth')

router.post("/register", async (req, res) => {
    try {
        const { email, password, passwordCheck, firstName, lastName, competitions } = req.body;

        // Validation
        if (!email || !password || !passwordCheck || !firstName || !lastName)
            return res.status(400).json({ msg: "Please provide a value for all required fields" });

        if (password.length < 6)
            return res.status(400).json({ msg: "Password must be at least 6 characters long" });

        if (password !== passwordCheck)
            return res.status(400).json({ msg: "Passwords do not match" });

        if (firstName.length > 32 || firstName.length < 2)
            return res.status(400).json({ msg: `First name is too ${firstName.length > 2 ? 'long': 'short'}` })
        if (firstName.length > 32 || firstName.length < 2)
            return res.status(400).json({ msg: `Last name is too ${firstName.length > 2 ? 'long': 'short'}` })

        if (await User.findOne({ email: email }))
            return res.status(400).json({ msg: "Account with this email already exists" });

        const salt = await bycrypt.genSalt();
        const passwordHash = await bycrypt.hash(password, salt);

        res.json(await new User({
            email,
            password: passwordHash,
            firstName,
            lastName,
            competitions
        }).save());

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ msg: "Please enter an email and password" });

        const user = await User.findOne({ email: email });
        if (!user)
            return res.status(400).json({ msg: "No user with this email exists" })

        if (!await bycrypt.compare(password, user.password))
            return res.status(400).json({ msg: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                competititions: user.competitions
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post("/update", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user)
        if (!user) res.status(400).json({ msg: "User does not exist" })
        const { email, firstName, lastName, competitions } = req.body

        if (email) user.email = email
        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (typeof competitions === 'object' && competitions !== null) {
            for (key of Object.keys(competitions)) {
                user.competitions[key] = competitions[key]
            }
        }

        await user.save()
        res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            competititions: user.competitions
        })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.post("/isTokenValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false)

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.json(false)
            const user = await User.findById(decoded.id)
            if (!user) return res.json(false)
        });
        
        return res.json(true)

    } catch (err) {
        res.status(500).json({ error: err.message });
    }


})


router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user)
    delete user.password
    res.json(user)
})

module.exports = router;