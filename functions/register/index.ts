import { IActionResponse, PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const register = async (req: Request, res: Response) => {
  const response: IActionResponse = {
    result: 'success',
    details: '',
  };
  
  try {
    const { body } = req;
    const { slackId, name } = body;
    const result = await PlayerModel.create({ slackId, name });
    if (result.name) {
      response.details = `User with name ${result.name} has been created.`;
      return res.json(response);
    }
    throw new Error('User could not be created.');
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'There was an error when attempting to create a user.';
    return res.json(response);
  }
};

export {
  register,
};
