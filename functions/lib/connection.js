"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.default = mongoose.connect(process.env.MONGO_URL);
//# sourceMappingURL=connection.js.map