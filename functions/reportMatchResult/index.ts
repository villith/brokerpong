import { IActionResponse, IEloChange, MatchModel, Player, PlayerModel, ResultModel, connection } from '@team-scott/pong-domain';
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
    const { body: { slackId, matchResult } } = req;
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
      const roles: Record<string, Player> = {};

      roles.submitter = slackId === p1.slackId ? p1 : p2; // Who submitted the match
      roles.otherPlayer = slackId === p1.slackId ? p2 : p1;
      
      roles.winner = matchResult === 'win' ? roles.submitter : roles.otherPlayer;
      roles.loser = roles.otherPlayer.slackId === roles.winner.slackId ? roles.submitter : roles.otherPlayer;
      
      if (canReport) {
        const winnerElo = updateRating(
          getExpected(roles.winner.elo, roles.loser.elo),
          1,
          roles.winner.elo,
        );

        const loserElo = updateRating(
          getExpected(roles.loser.elo, roles.winner.elo),
          0,
          roles.loser.elo,
        );

      
        await MatchModel.updateOne({
          _id: match._id,
        }, {
          winner: roles.winner._id,
          loser: roles.loser._id,
          status: 'completed',
          completedAt: new Date(),
        });

        await ResultModel.create({
          match: match._id,
          winner: roles.winner._id,
          loser: roles.loser._id,
          winnerElos: {
            start: roles.winner.elo,
            end: winnerElo,
          },
          loserElos: {
            start: roles.loser.elo,
            end: loserElo,
          },
        })

        await Promise.all([
          PlayerModel.updateOne({ 
            _id: roles.winner._id,
          }, {
            elo: winnerElo,
            wins: roles.winner.wins + 1,
          }),
          PlayerModel.updateOne({
            _id: roles.loser._id,
          }, {
            elo: loserElo,
            losses: roles.loser.losses + 1,
          }),
        ]);

        const eloChangeResult = {} as IEloChange;
        eloChangeResult.winner = Object.assign({}, roles.winner, {
          originalElo: roles.winner.elo,
          difference: winnerElo - roles.winner.elo,
        });
        eloChangeResult.loser = Object.assign({}, roles.loser, {
          originalElo: roles.loser.elo,
          difference: loserElo - roles.loser.elo,
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
