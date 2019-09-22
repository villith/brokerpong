import { PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const getPlayerInfo = async (req: Request, res: Response) => {
  const player = await PlayerModel.findOne({ name: 'scott' });
  return res.json(player);
};

export {
  getPlayerInfo,
}