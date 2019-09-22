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
const pong_domain_1 = require("@team-scott/pong-domain");
(() => __awaiter(this, void 0, void 0, function* () { yield pong_domain_1.connection(process.env.MONGO_URL); }))();
const getPlayerInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const player = yield pong_domain_1.PlayerModel.findOne({ name: 'scott' });
    return res.json(player);
});
exports.getPlayerInfo = getPlayerInfo;
//# sourceMappingURL=index.js.map