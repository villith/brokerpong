import { Player } from "@team-scott/pong-domain";

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

const buildPlayerName = (player: Player, mrkdwn = false) => {
  let playerName = '';
  const { nickname, emojiFlair } = player;
  let { name } = player;
  if (nickname) {
    playerName = `${nickname}`;
    if (mrkdwn) {
      name = `*(${name})*`;
    } else {
      name = `(${name})`;
    }
    playerName = `${playerName} ${name}`;
  } else {
    playerName = name;
  }
  if (emojiFlair) {
    playerName = `${playerName} ${emojiFlair}`;
  }
  return playerName; 
};

export {
  buildPlayerName,
  getExpected,
  updateRating,
}