import { PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const addPlayer = async (req: Request, res: Response) => {
  try {
    console.dir(req);
    const { body } = req;
    const { name } = body;
    const result = await PlayerModel.create({ name });
    if (result.name) {
      return res.json({
        result: `User with name ${result.name} has been created.`,
      });
    }
    return res.json({
      result: 'User could not be created.',
    });
  } catch (err) {
    return res.json({
      result: `There was an error when attempting to create a user. ${err}`,
    });
  }
};

export {
  addPlayer,
};
