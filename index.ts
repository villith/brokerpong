import bodyParser from 'body-parser';
import { challengePlayer } from './functions/challengePlayer';
import { challengeResponse } from './functions/challengeResponse';
import { changeNickname } from './functions/changeNickname';
import dotenv from 'dotenv';
import express from 'express';
import { getMatchHistory } from './functions/getMatchHistory';
import { getOngoingMatches } from './functions/getOngoingMatches';
import { getPlayerInfo } from './functions/getPlayerInfo';
import { printStandings } from './functions/printStandings';
import { register } from './functions/register';
import { reportMatchResult } from './functions/reportMatchResult';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.listen(PORT)
console.log('listening on port ', PORT);

app.use(bodyParser.json());

app.get('/getPlayerInfo', (req, res) => {
  getPlayerInfo(req, res);
});

app.get('/getOngoingMatches', (req, res) => {
  getOngoingMatches(req, res);
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

app.post('/challenge-response', (req, res) => {
  console.log('[challenge-response]');
  challengeResponse(req, res);
});

app.post('/report-match-result', (req, res) => {
  console.log('[report-match-result]');
  reportMatchResult(req, res);
});

app.get('/get-match-history', (req, res) => {
  console.log('[get-match-history]');
  getMatchHistory(req, res);
});

app.get('/print-standings', (req, res) => {
  console.log('[print-standings]');
  printStandings(req, res);
});