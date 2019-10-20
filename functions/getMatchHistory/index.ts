import { IActionResponse, MatchModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const getMatchHistory = async (req: Request, res: Response) => {
  const response: IActionResponse = {
    result: 'success',
    details: '',
  };

  try {
    const {
      start,
      stop,
      playerId,
    } = req.query;

    const query: any = {
      status: 'completed',
    };

    if (playerId) {
      query.$or = [
        { initiator: playerId },
        { target: playerId },
      ]
    }

    const startInt = parseInt(start, 10);
    const stopInt = parseInt(stop, 10);
    const limit = stopInt - startInt;

    const matches = await MatchModel
      .find(query)
      .skip(startInt)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('initiator')
      .populate('target');
    
    const count = await MatchModel.countDocuments(query);

    console.log(startInt, stopInt, limit);
    console.log(`Found ${matches.length} matches.`);

    return res.json({
      matches,
      count,
    });
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  getMatchHistory,
};
