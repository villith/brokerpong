import { IActionResponse, connection } from '@team-scott/pong-domain';
import { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

(async () => { await connection(process.env.MONGO_URL!) })();

const reportMatchResult = async (req: Request, res: Response) => {
  const response: IActionResponse = {
    result: 'success',
    details: '',
  };

  try {
    return res.json({ placeholder: `hello this is reportMatchResult` });
  } catch (err) {
    response.result = 'error';
    response.error = err.message;
    response.details = 'placeholder';

    return res.json(response);
  }  
};

export {
  reportMatchResult,
};
