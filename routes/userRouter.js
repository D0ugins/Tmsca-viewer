const router = require("express").Router();
const bycrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const School = require("../models/schoolModel");
const auth = require('../middleware/auth');

router.post("/register", async (req, res) => {
    try {
        const { schoolCode, password, passwordCheck, competitions } = req.body;

        // Validation
        if (!schoolCode || !password || !passwordCheck)
            return res.status(400).json({ msg: "Please provide a value for all required fields" });

        const school = await School.findOne({ code: schoolCode.toLowerCase() });
        if (!school)
            return res.status(400).json({ msg: "School has not registered. Ask your teacher if you are unsure of your school code" })

        if (password.length < 6)
            return res.status(400).json({ msg: "Password must be at least 6 characters long" });

        if (password !== passwordCheck)
            return res.status(400).json({ msg: "Passwords do not match" });


        const username = schoolCode.toLowerCase() + school.students.length;
        const salt = await bycrypt.genSalt();
        const passwordHash = await bycrypt.hash(password, salt);
        const user = new User({
            username,
            password: passwordHash,
            school: school.code,
            competitions
        })
        school.students.push(user._id);

        await school.save();
        res.json(await user.save())

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ msg: "Please enter a username and password" });

        const user = await User.findOne({ username });
        if (!user)
            return res.status(400).json({ msg: "No user with this username exists" })

        if (!await bycrypt.compare(password, user.password))
            return res.status(400).json({ msg: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                competititions: user.competitions
            }
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }
})

router.post("/update", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user)
        if (!user) res.status(400).json({ msg: "User does not exist" })
        const { username, competitions } = req.body

        if (username) user.username = username
        if (typeof competitions === 'object' && competitions !== null) {
            for (key of Object.keys(competitions)) {
                user.competitions[key] = competitions[key]
            }
        }

        await user.save()
        res.json({
            id: user._id,
            username: user.username,
            competititions: user.competitions
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }

})

router.post("/isTokenValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false)

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            // Check if token was decoded succsesfuly
            if (!err && decoded) {
                // Check if user actually exists
                if (await User.findById(decoded.id)) return res.json(true)
            }
            // Otherwise return false
            return res.json(false)
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message });
    }
})

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user)
    if (user) {
        delete user.password
        return res.json(user)
    }
    else {
        return res.json({ err: "User no longer exists" })
    }
})

module.exports = router;