import {join} from 'path';

export const CONSTANTS = {
  folderPath: process.env.DATA || join(__dirname, `../../../data`),
};
