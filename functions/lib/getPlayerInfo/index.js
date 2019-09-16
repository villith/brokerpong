"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("../models/Player");
const connection_1 = require("../connection");
(() => __awaiter(this, void 0, void 0, function* () { yield connection_1.default; }))();
const getPlayerInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const player = yield Player_1.default.findOne({ name: 'scott' });
    return res.json(player);
});
exports.getPlayerInfo = getPlayerInfo;
//# sourceMappingURL=index.js.map