import { IActionResponse, Match, MatchModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const getOngoingMatches = async (req: Request, res: Response) => {
  const response: IActionResponse<Match[]> = {
    result: 'success',
    details: '',
  };

  try {
    const ongoingMatches = await MatchModel.find({
      status: {
        $in: ['accepted', 'pending']
      }
    })
      .populate('initiator')
      .populate('target');

    response.data = ongoingMatches;
    return res.json(response);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }
};

export {
  getOngoingMatches,
};
