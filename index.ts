import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import { getPlayerInfo } from './functions/getPlayerInfo';
import { testFunction } from './functions/testFunction';
import { testFunctionThree } from './functions/testFunctionThree';
import { testFunctionTwo } from './functions/testFunctionTwo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.listen(PORT)
console.log('listening on port ', PORT);

app.use(bodyParser.json());

app.get('/getPlayerInfo', (req, res) => {
  getPlayerInfo(req, res);
});

app.get('/testFunction', (req, res) => {
  testFunction(req, res);
});

app.get('/testFunctionTwo', (req, res) => {
  testFunctionTwo(req, res);
});

app.get('/testFunctionThree', (req, res) => {
  testFunctionThree(req, res);
});