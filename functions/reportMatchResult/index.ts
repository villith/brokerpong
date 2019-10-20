import { IActionResponse, IEloChange, MatchModel, Player, PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const K_FACTOR = 48;

const getExpected = (
  a: number,
  b: number,
) => 1 / (1 + Math.pow(10, ((b - a) / 400)));

const updateRating = (
  expected: number,
  actual: number,
  current: number,
) => Math.round(current + K_FACTOR * (actual - expected));

const reportMatchResult = async (req: Request, res: Response) => {
  const response: IActionResponse<IEloChange> = {
    result: 'success',
    details: '',
  };

  try {
    const { body: { slackId, myScore, opponentScore } } = req;
    const ongoingMatches = await MatchModel.find({
      status: {
        $in: ['accepted'],
      },
    })
      .populate('initiator')
      .populate('target')
      .lean();

    
    if (ongoingMatches.length > 0) {
      const [match] = ongoingMatches;
      const p1 = match.initiator as Player;
      const p2 = match.target as Player;
      const canReport = p1.slackId === slackId || p2.slackId === slackId;
      if (canReport) {
        const initiatorScore = p1.slackId === slackId ? myScore : opponentScore;
        const targetScore = p2.slackId === slackId ? myScore : opponentScore;

        const initiatorElo = updateRating(
          getExpected(p1.elo, p2.elo),
          initiatorScore > targetScore ? 1 : 0,
          p1.elo,
        );

        const targetElo = updateRating(
          getExpected(p2.elo, p1.elo),
          targetScore > initiatorScore ? 1 : 0,
          p2.elo,
        );

      
        await MatchModel.updateOne({
          _id: match._id,
        }, {
          initiatorScore,
          targetScore,
          status: 'completed',
          completedAt: new Date(),
        });

        await Promise.all([
          PlayerModel.updateOne({ 
            _id: p1._id,
          }, {
            elo: initiatorElo,
          }),
          PlayerModel.updateOne({
            _id: p2._id,
          }, {
            elo: targetElo,
          }),
        ]);

        const eloChangeResult = {} as IEloChange;
        eloChangeResult.initiator = Object.assign({}, p1, {
          originalElo: p1.elo,
          difference: initiatorElo - p1.elo,
        });
        eloChangeResult.target = Object.assign({}, p2, {
          originalElo: p2.elo,
          difference: targetElo - p2.elo,
        });
        response.details = 'Your match result has been submitted.';
        response.data = eloChangeResult;

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
