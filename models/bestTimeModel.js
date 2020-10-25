const mongoose = require("mongoose");

const bestTimeSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullName: { type: String, required: true }
    },
    trickId: { type: Number, required: true },
    time: { type: Number, min: 0 },
});

module.exports = BestTime = mongoose.model("bestTime", bestTimeSchema)