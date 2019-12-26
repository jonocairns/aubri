import ffmpeg from 'fluent-ffmpeg';
console.log(`attempting to change paths for ffmpeg...`);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffprobePath = require('@ffprobe-installer/ffprobe');

console.log(`setting ffmpeg path ${ffmpegInstaller.path}`);
console.log(`setting probe path ${ffprobePath.path}`);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobePath.path);

console.log(`set ffmpeg paths`);

export default ffmpeg;
