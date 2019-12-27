import dotenv from 'dotenv';
import {Request, Response} from 'express';

dotenv.config();

export interface Settings {
  clientId: string;
  domain: string;
}

export const settings = async (req: Request, res: Response) => {
  const settings = {
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
  };
  res.json(settings);
};
