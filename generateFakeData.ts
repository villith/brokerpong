import { MatchModel, Player, PlayerModel, ResultModel, connection } from '@team-scott/pong-domain';

import dotenv from 'dotenv';
import faker from 'faker';
import moment from 'moment';

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

const NUM_PLAYERS = 10;
const NUM_MATCHES = 1000;

const generateFakeData = async () => {
  const players = [];
  const matches = [];

  for (let i = 0; i < NUM_PLAYERS; i += 1) {
    const player = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      nickname: chance(0.7) ? `${faker.random.word()}` : undefined,
      slackId: faker.random.uuid(),
    };
    players.push(player);
  }

  const createdPlayers = await Promise.all(players.map(player => PlayerModel.create(player)));

  for (let i = 0; i < NUM_MATCHES; i += 1) {
    const initiator = createdPlayers[Math.floor(Math.random() * players.length)];
    let target = createdPlayers[Math.floor(Math.random() * players.length)];
    while (initiator._id === target._id) {
      target = createdPlayers[Math.floor(Math.random() * players.length)];
    }
    const randomDate = faker.date.between(moment().subtract(1, 'year').toDate(), moment().toDate());
    const match = {
      initiator: initiator._id,
      target: target._id,
      createdAt: randomDate,
    };
    matches.push(match);
  } 

  const createdMatches = await Promise.all(matches.map(match => MatchModel.create(match)));
  const sortedMatches = createdMatches.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

  for (const match of sortedMatches) {
    const populatedMatch = await match.populate('initiator').populate('target').execPopulate();
    const p1 = populatedMatch.initiator as Player;
    const p2 = populatedMatch.target as Player;
    const winner = chance(0.5) ? 0 : 1;
    const roles: Record<string, Player> = {};

    roles.winner = winner ? p1 : p2;
    roles.loser = winner ? p2 : p1;

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

    const completedAt = moment(match.createdAt).add(1, 'hour').toDate();

    await MatchModel.updateOne({
      _id: match._id,
    }, {
      winner: roles.winner._id,
      loser: roles.loser._id,
      status: 'completed',
      completedAt,
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
      createdAt: completedAt,
    })

    await Promise.all([
      PlayerModel.updateOne({ 
        _id: roles.winner._id,
      }, {
        elo: winnerElo,
      }),
      PlayerModel.updateOne({
        _id: roles.loser._id,
      }, {
        elo: loserElo,
      }),
    ]);
    console.log(`finished ${match._id}`);
  }
}

(async () => {
  await generateFakeData();
  process.exit(0);
})();