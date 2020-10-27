const BestTime = require('../models/bestTimeModel')
const User = require('../models/userModel')
const auth = require('../middleware/auth')
const router = require("express").Router();

router.post("/bestTimes", auth, async (req, res) => {
    try {
        const { trick, time } = req.body;
        if (!time || trick == null) return res.status(401).json({ msg: "No trick and/or time provided" })

        let user = await User.findById(req.user);
        if (!user) return res.status(401).json({ msg: "User does not exist" })

        let old = await BestTime.findOne({ 'user._id': req.user, trick })
        if (!old) {
            // If no best time yet craete a new one and save it
            return res.json(await new BestTime({
                user: {
                    _id: req.user,
                    fullName: user.firstName + " " + user.lastName
                },
                trick,
                time
            }).save())
        } else {
            // If there was one check to make sure it is faster then update it
            if (old.time >= parseFloat(time)) old.time = time
            else return (res.json(null))

            return (await old.save())
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ err: err.message })
    }
})

router.get("/bestTimes", auth, async (req, res) => {
    try {

        const { trick } = req.query

        if (trick != null) {
            // If requestion specific trick return that
            let time = await BestTime.findOne({ 'user._id': req.user, trick })

            if (time) return res.json({ time: time.time })
            else return res.json({ time: null })
        } else {
            // If no trick specified return all tricks that have times
            let times = await BestTime.find({ 'user._id': req.user })

            let obj = {}
            times.map(time => {
                obj[time.trick] = time.time
            })

            return res.json(obj)
        }

    } catch (err) {
        console.error(err)
        return res.status(500).json({ err: err.message })
    }
})

module.exports = router