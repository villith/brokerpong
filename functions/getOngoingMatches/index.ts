import { IActionResponse, Match, MatchModel, Player, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

type TempMatch = Match | {
  playerOneRecentMatches: Match[];
  playerTwoRecentMatches: Match[];
}
const getOngoingMatches = async (req: Request, res: Response) => {
  const response: IActionResponse<TempMatch[]> = {
    result: 'success',
    details: '',
  };

  try {
    const [match] = await MatchModel.find({
      status: {
        $in: ['accepted', 'pending']
      }
    })
      .populate('initiator')
      .populate('target');

    const { initiator, target } = match;

    const playerOne = initiator as Player;
    const playerTwo = target as Player;

    const [playerOneRecentMatches, playerTwoRecentMatches] = await Promise.all(
      [playerOne, playerTwo].map((player) => (
        MatchModel.find({
          status: 'completed',
          $or: [
            { initiator: player._id },
            { target: player._id },
          ],
        })
          .sort({ completedAt: -1 })
          .limit(5)
          .populate('initiator')
          .populate('target')
      )),
    );

    const tempMatch = {
      ...match,
      playerOneRecentMatches,
      playerTwoRecentMatches,
    };

    response.data = [tempMatch];
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
