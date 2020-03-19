import ffmpeg, {FfprobeData} from 'fluent-ffmpeg';
import {basename} from 'path';
import {promisify} from 'util';

import {readDirAsync, strongHash} from '../controllers/audio';
import {objectToProps} from './mapper';
import {File} from './schema';

const probeP = promisify(ffmpeg.ffprobe);

export const workFiles = async (folder: string, bookId: string) => {
  const files = await readDirAsync(folder);

  const filePromises = files.map(async location => {
    const meta = (await probeP(location)) as FfprobeData;

    const id = strongHash(`${bookId}${location}`);

    const tags = meta.format.tags as {title?: string};

    return objectToProps({
      id,
      bookId,
      duration: meta.format.duration,
      size: meta.format.size,
      bitrate: meta.format.bit_rate,
      format: meta.format.format_name,
      dateCreatedUtc: new Date().toISOString(),
      lastUpdatedUtc: new Date().toISOString(),
      location,
      filename: basename(location),
      title: (tags && tags.title) || '',
    } as File);
  });

  return Promise.all(filePromises);
};
