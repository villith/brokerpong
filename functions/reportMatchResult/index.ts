import { IActionResponse, MatchModel, Player, ResultModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const reportMatchResult = async (req: Request, res: Response) => {
  const response: IActionResponse = {
    result: 'success',
    details: '',
  };

  try {
    const { body: { matchId, slackId, myScore, opponentScore } } = req;
    const ongoingMatches = await MatchModel.find({
      status: {
        $in: ['accepted'],
      },
    })
      .populate('initiator')
      .populate('target');

    
    if (ongoingMatches.length > 0) {
      const [match] = ongoingMatches;
      const p1 = match.initiator as Player;
      const p2 = match.target as Player;
      const canReport = p1.slackId === slackId || p2.slackId === slackId;
      if (canReport) {
        const initiatorScore = p1.slackId === slackId ? myScore : opponentScore;
        const targetScore = p2.slackId === slackId ? myScore : opponentScore;
        
        console.log(match);
        console.log(matchId);
        await ResultModel.create({
          match: match._id,
          initiatorScore,
          targetScore,
        });
        await match.update({
          status: 'completed',
          completedAt: new Date(),
        });

        response.details = 'Your match result has been submitted.';

        return res.json(response);
      }
    }
    response.result = 'error';
    response.error = 'There are no ongoing matches to submit a result for.';
    response.details = 'placeholder';
    return res.json(response);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  reportMatchResult,
};
