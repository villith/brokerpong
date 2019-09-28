import { IActionResponse, PlayerModel, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const changeNickname = async (req: Request, res: Response) => {
  const response: IActionResponse ={
    result: 'success',
    details: '',
  };
  
  try {
    const { body } = req;
    const { name, nickname } = body;
    const result = await PlayerModel.findOneAndUpdate({ name }, { nickname }).lean();
    if (result) {
      response.details = `${name}'s nickname has been set to ${nickname}`;
      return res.json(response);
    }
    response.details = 'Nickname could not be updated.';
    return res.json(response);
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = `There was an error when attempting to update a user's nickname. ${err}`;
    return res.json(response);
  }
};

export {
  changeNickname,
};
