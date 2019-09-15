import { AddressInfo } from 'net';
import { createEventAdapter } from '@slack/events-api';
import dotenv from 'dotenv';

dotenv.config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
console.log(slackSigningSecret);
const slackEvents = createEventAdapter(slackSigningSecret);

const port = parseInt(process.env.PORT!, 10) || 8005;

// @ts-ignore
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

(async () => {
  const server = await slackEvents.start(port);

  const serverPort = ((server.address()) as AddressInfo).port;
  console.log(`Listening for events on ${serverPort}`);
})();

