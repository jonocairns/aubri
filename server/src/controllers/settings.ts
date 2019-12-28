import dotenv from 'dotenv';
import {Request, Response} from 'express';

dotenv.config();

export interface Settings {
  clientId: string;
  domain: string;
  audience: string;
}

export const settings = async (req: Request, res: Response) => {
  const settings: Settings = {
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    audience: process.env.AUDIENCE,
  };
  res.json(settings);
};
