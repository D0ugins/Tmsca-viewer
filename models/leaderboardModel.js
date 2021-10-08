const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
    trick: { type: String, required: true },
    times: [{
        user: {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true },
            username: { type: String }
        },
        time: { type: Number, min: 0 },
    }]

});

module.exports = Leaderboard = mongoose.model("leaderboard", leaderboardSchema);