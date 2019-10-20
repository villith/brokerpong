import { IActionResponse, Match, MatchModel, PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import { buildPlayerName } from '../helpers';
import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const challengePlayer = async (req: Request, res: Response) => {
  const response: IActionResponse<Match> = {
    result: 'success',
    details: '',
  };

  try {
    const { body } = req;
    const { initiator, target } = body;
    const ongoingMatches = await MatchModel.find({
      status: {
        $in: ['accepted', 'pending']
      }
    });

    if (ongoingMatches.length > 0) {
      throw new Error('There is already an ongoing match, and we only have one table!');
    }

    const promiseArray = [
      PlayerModel.findOne({ slackId: initiator }),
      PlayerModel.findOne({
        $or: [
          { name: target, },
          { nickname: target },
        ],
      }),
    ];
    
    const [foundInitiator, foundTarget] = await Promise.all(promiseArray);

    if (foundInitiator && foundTarget) {
      if (foundInitiator.id === foundTarget.id) {
        throw new Error('You cannot challenge yourself.');
      }
      let createdMatch = await MatchModel.create({
        initiator: foundInitiator.id,
        target: foundTarget.id,
      });

      createdMatch = await createdMatch.populate('initiator').populate('target').execPopulate();

      response.data = createdMatch;
      response.details = `${buildPlayerName(foundInitiator)} has challenged ${buildPlayerName(foundTarget)} to a match!`;

      return res.json(response);
    }

    throw new Error(`${target} could not be found. Did you make a typo?`);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'There was an error when trying to challenge a player.';

    return res.json(response);
  }
};

export {
  challengePlayer,
};
