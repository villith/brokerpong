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
const events_api_1 = require("@slack/events-api");
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = events_api_1.createEventAdapter(slackSigningSecret);
const port = parseInt(process.env.PORT, 10) || 8005;
// @ts-ignore
slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});
(() => __awaiter(this, void 0, void 0, function* () {
    const server = yield slackEvents.start(port);
    const serverPort = (server.address()).port;
    console.log(`Listening for events on ${serverPort}`);
}))();
//# sourceMappingURL=index.js.map