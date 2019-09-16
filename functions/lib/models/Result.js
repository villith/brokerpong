"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resultSchema = new mongoose_1.Schema({
    _id: mongoose_1.Schema.Types.ObjectId,
    match: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Match' },
    initatorScore: Number,
    targetScore: Number,
}, { collection: 'result' });
const Result = mongoose_1.model('Result', resultSchema);
exports.default = Result;
//# sourceMappingURL=Result.js.map