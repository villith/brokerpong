import bodyParser from 'body-parser';
import { challengePlayer } from './functions/challengePlayer';
import { changeNickname } from './functions/changeNickname';
import dotenv from 'dotenv';
import express from 'express';
import { getPlayerInfo } from './functions/getPlayerInfo';
import { register } from './functions/register';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.listen(PORT)
console.log('listening on port ', PORT);

app.use(bodyParser.json());

app.get('/getPlayerInfo', (req, res) => {
  getPlayerInfo(req, res);
});

app.post('/register', (req, res) => {
  console.log('[register]');
  register(req, res);
});

app.post('/change-nickname', (req, res) => {
  console.log('[changeNickname]');
  changeNickname(req, res);
});

app.post('/challenge-player', (req, res) => {
  console.log('[challenge-player]');
  challengePlayer(req, res);
});
