import { PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

(async () => { await connection })();

const getPlayerInfo = async (req: Request, res: Response) => {
  const player = await PlayerModel.findOne({ name: 'scott' });
  return res.json(player);
};

export {
  getPlayerInfo,
}