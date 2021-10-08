const mongoose = require("mongoose");

const NsResultSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true, default: "Number Sense" },
    score: { type: Number, min: -320, max: 400 },
    takenAt: { type: Date, default: Date.now },
})

const MthSciResultSchema = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true },
    score: { type: Number, min: -100, max: 250 },
    takenAt: { type: Date, default: Date.now },
})

const CaResultSchmea = new mongoose.Schema({
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        username: { type: String, required: true }
    },
    test_name: { type: String, required: true },
    type: { type: String, required: true, default: "Calculator" },
    score: { type: Number, min: -320, max: 400 },
    takenAt: { type: Date, default: Date.now },
})

module.exports = {
    NsResult: mongoose.model("nsResult", NsResultSchema),
    MthSciResult: mongoose.model("mthSciResult", MthSciResultSchema),
    CaResult: mongoose.model("caReuslt", CaResultSchmea)
}