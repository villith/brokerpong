import { Request, Response } from 'express';

import { PlayerModel } from 'models';
import connect from 'connection';

(async () => { await connect })();

const getPlayerInfo = async (req: Request, res: Response) => {
  const player = await PlayerModel.findOne({ name: 'scott' });
  return res.json(player);
};

export {
  getPlayerInfo,
}