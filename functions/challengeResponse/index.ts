import { IActionResponse, MatchModel, MatchStatus, Player, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const challengeResponse = async (req: Request, res: Response) => {
  const response: IActionResponse<{ announcement: string }> = {
    result: 'success',
    details: '',
  };

  try {
    const { matchId, type, slackId } = req.body;
    const match = await MatchModel.findById(matchId)
      .populate('initiator')
      .populate('target');
      
    if (match) {
      if (match.status !== 'pending') {
        throw new Error(`Match has already been ${match.status}`);
      }
      const initiator = match.initiator as Player;
      const target = match.target as Player;
      if (target.slackId !== slackId) {
        throw new Error(`You cannot accept or decline a challenge for other players.`);
      }
      let newStatus = '' as MatchStatus;
      if (type === 'accept_challenge') {
        newStatus = 'accepted';
      }
      else if (type === 'decline_challenge') {
        newStatus = 'rejected';
      } else {
        throw new Error(`${type} is not a valid response.`);
      }
      await match.update({
        status: newStatus,
        [`${newStatus}At`]: new Date(),
      });

      response.details = `You have ${newStatus} this match.`;
      
      response.data = {
        announcement: `<@${initiator.slackId}> your match has been ${newStatus}!`,
      };
      
      return res.json(response);
    }
    throw new Error(`Match with id: ${matchId} could not be found.`);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  challengeResponse,
};
