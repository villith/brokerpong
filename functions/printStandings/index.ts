import { IActionResponse, Intervals, PlayerModel, Result, ResultModel, Standings, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import { buildPlayerName } from '../helpers';
import dotenv from 'dotenv';
import moment from 'moment';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const printStandings = async (req: Request, res: Response) => {
  const response: IActionResponse<Standings> = {
    result: 'success',
    details: '',
  };

  try {
    const { query: { interval } } = req;
    const typedInterval = interval as Intervals;
    const currentDate = moment();
    
    const relativeDates: Record<Intervals, Date> = {
      daily: currentDate.startOf('day').toDate(),
      weekly: currentDate.startOf('week').toDate(),
      monthly: currentDate.startOf('month').toDate(),
      yearly: currentDate.startOf('year').toDate(),
    };

    const startDate = relativeDates[typedInterval];
    
    const results = await ResultModel.find({
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 }).lean();

    const standings: Standings = {};

    results.forEach((result: Result) => {
      const {
        winner,
        loser,
        winnerElos,
        loserElos,
      } = result;

      if ({}.hasOwnProperty.call(standings, winner.toString())) {
        standings[winner.toString()].wins += 1;
        standings[winner.toString()].eloChange += (winnerElos.end - winnerElos.start);
        standings[winner.toString()].currentElo = winnerElos.end;
      } else {
        standings[winner.toString()] = {
          wins: 1,
          losses: 0,
          eloChange: winnerElos.end - winnerElos.start,
          currentElo: winnerElos.end,
          playerName: '',
        }
      }

      if ({}.hasOwnProperty.call(standings, loser.toString())) {
        standings[loser.toString()].losses += 1;
        standings[loser.toString()].eloChange += (loserElos.end - loserElos.start);
        standings[loser.toString()].currentElo = loserElos.end;
      } else {
        standings[loser.toString()] = {
          wins: 0,
          losses: 1,
          eloChange: loserElos.end - loserElos.start,
          currentElo: loserElos.end,
          playerName: '',
        }
      }
    });

    const playerIds = Object.keys(standings);
    
    const players = await PlayerModel.find({ _id: { $in: playerIds } });

    players.forEach((player) => standings[player._id].playerName = buildPlayerName(player, { nicknameOnly: true }));

    response.data = standings;
    response.details = `${interval} standings report`;

    return res.json(response);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  printStandings,
};
