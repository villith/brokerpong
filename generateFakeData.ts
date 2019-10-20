import { MatchModel, Player, PlayerModel, connection } from '@team-scott/pong-domain';

import dotenv from 'dotenv';
import faker from 'faker';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL! )})();

const chance = (percent: number) => Math.random() < percent;

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

const generateFakeData = async () => {
  const players = [];
  const matches = [];

  for (let i = 0; i < 10; i += 1) {
    const player = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      nickname: chance(0.7) ? `${faker.random.word()}` : undefined,
      slackId: faker.random.uuid(),
    };
    players.push(player);
  }

  const createdPlayers = await Promise.all(players.map(player => PlayerModel.create(player)));

  for (let i = 0; i < 100; i += 1) {
    const initiator = createdPlayers[Math.floor(Math.random() * players.length)];
    let target = createdPlayers[Math.floor(Math.random() * players.length)];
    while (initiator._id === target._id) {
      target = createdPlayers[Math.floor(Math.random() * players.length)];
    }
    const match = {
      initiator: initiator._id,
      target: target._id,
    };
    matches.push(match);
  } 

  const createdMatches = await Promise.all(matches.map(match => MatchModel.create(match)));

  for (const match of createdMatches) {
    const populatedMatch = await match.populate('initiator').populate('target').execPopulate();
    const p1 = populatedMatch.initiator as Player;
    const p2 = populatedMatch.target as Player;
    const winner = chance(0.5) ? 0 : 1;
    const initiatorScore = winner ? 21 : Math.floor(Math.random() * 20);
    const targetScore = winner ? Math.floor(Math.random() * 20) : 21;

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
  }
}

(async () => {
  await generateFakeData();
  process.exit(0);
})();