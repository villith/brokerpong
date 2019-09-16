"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = __importDefault(require("./models/Player"));
const web_api_1 = require("@slack/web-api");
const body_parser_1 = __importDefault(require("body-parser"));
const events_api_1 = require("@slack/events-api");
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const CMD = process.env.COMMAND_INITIATOR;
const COMMANDS = {
    challenge: '',
    commands: '',
    getPlayerInfo: '',
};
mongoose_1.default.connect(process.env.MONGO_URL);
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const token = process.env.SLACK_TOKEN;
const port = process.env.PORT || 3000;
const slackEvents = events_api_1.createEventAdapter(slackSigningSecret);
const web = new web_api_1.WebClient(token);
// Create an express application
const app = express_1.default();
// Plug the adapter in as a middleware
app.use('/', slackEvents.requestListener());
// Example: If you're using a body parser, always put it after the event adapter in the middleware stack
app.use(body_parser_1.default());
// Initialize a server for the express app - you can skip this and the rest if you prefer to use app.listen()
const server = http_1.createServer(app);
server.listen(port, () => {
    // Log a message when the server is ready
    // @ts-ignore
    console.log(`Listening for events on ${server.address().port}`);
});
slackEvents.on('message', (event) => __awaiter(this, void 0, void 0, function* () {
    const { text, channel, } = event;
    if (text.charAt(0) !== CMD) {
        return;
    }
    const textCommand = text.substr(1, text.indexOf(' '));
    const command = COMMANDS[textCommand];
    if (!command) {
        return `${textCommand} is not a command. Type !commands for a command list.`;
    }
    const player = yield Player_1.default.findOne({ name: 'Scott' });
    if (player) {
        const result = yield web.chat.postMessage({
            text: `This is their nickname: ${player.nickname}`,
            channel,
        });
        console.log('result obj from posting msg');
        console.log(result);
    }
    console.log('this is a message!');
    console.log(event);
    return;
}));
//# sourceMappingURL=index.js.map