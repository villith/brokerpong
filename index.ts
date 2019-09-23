import bodyParser from 'body-parser';
import { changeNickname } from './functions/changeNickname';
import dotenv from 'dotenv';
import express from 'express';
import { getPlayerInfo } from './functions/getPlayerInfo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.listen(PORT)
console.log('listening on port ', PORT);

app.use(bodyParser.json());

app.get('/getPlayerInfo', (req, res) => {
  getPlayerInfo(req, res);
});

app.post('/changeNickname', (req, res) => {
  changeNickname(req, res);
});

