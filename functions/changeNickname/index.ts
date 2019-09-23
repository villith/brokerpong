import { PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const changeNickname = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const { name, nickname } = body;
    const result = await PlayerModel.findOneAndUpdate({ name }, { nickname }).lean();
    if (result) {
      return res.json({
        result: `${name}'s nickname has been set to ${nickname}`,
      })
    }
    return res.json({
      result: 'Nickname could not be updated.',
    });
  } catch (err) {
    return res.json({
      result: `There was an error when attempting to update a user's nickname. ${err}`,
    });
  }
};

export {
  changeNickname,
};
