import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';

/**
 * S3 관련 설정 파일
 */

export function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (1 + date.getMonth())).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return year + '-' + month + '-' + day;
}

export function getTime() {
  const date = new Date();
  const hours = ('0' + date.getHours()).slice(-2);
  const min = ('0' + date.getMinutes()).slice(-2);
  const sec = ('0' + date.getSeconds()).slice(-2);

  return hours + min + sec;
}

export const uuid = randomUUID();

export const multerOptionsFactory = (configService: ConfigService): MulterOptions => {
  // s3 인스턴스 생성
  const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  return {
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      key(_req, file, done) {
        // const ext = path.extname(file.originalname); // 파일 확장자 추출
        // const basename = path.basename(file.originalname, ext); // 파일명 추출
        // // 파일 이름 중복 방지를 위해 '파일명_날짜.확장자' 형식으로 설정
        // done(null, `${basename}_${Date.now()}${ext}`);

        console.log(_req);

        const boardType = 'notice';
        const today = getToday();
        const time = getTime();
        done(null, `${boardType}/${today}/${time}_${uuid}`.replace(/ /g, ''));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 최대 10MB
  };
};
