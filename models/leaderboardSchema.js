const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
    trick: { type: String, required: true },
    times: {
        type: [{
            user: {
                _id: { type: mongoose.Schema.Types.ObjectId, required: true },
                fullName: { type: String, required: true }
            },
            time: { type: Number, min: 0 },
        }],
        set: (v) => v.sort((a, b) => a.time - b.time),
        get: (v) => v.sort((a, b) => a.time - b.time),
    }

});

module.exports = Leaderboard = mongoose.model("leaderboard", leaderboardSchema);