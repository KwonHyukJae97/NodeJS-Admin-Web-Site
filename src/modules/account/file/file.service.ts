import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AccountFile } from './entities/account-file';
import { randomUUID } from 'crypto';

/**
 * 파일 업로드 시, 필요 로직을 실질적으로 수행
 */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

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
  const ms = ('0' + date.getMilliseconds()).slice(-2);

  return hours + min + sec + ms;
}

export const uuid = randomUUID();

@Injectable()
export class FileService {
  constructor(@InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>) {}

  /**
   * 파일 업로드 기능
   */
  async uploadFile(accountId: number, file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    const today = getToday();
    const time = getTime();
    const dir = 'account';

    // S3 업로드
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: file.buffer,
      Key: `${dir}/${today}/${time}_${uuid}`,
    };

    try {
      s3.putObject(uploadParams, function (error, data) {
        if (error) {
          console.log('err: ', error, error.stack);
        } else {
          console.log(data, '정상 업로드 되었습니다.');
        }
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('업로드에 실패하였습니다.');
    }

    // 업로드 된 파일 url 가져오기
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${dir}/${today}/${time}_${uuid}`,
    };
    const url: string = await new Promise((r) =>
      s3.getSignedUrl('getObject', getParams, async (err, url) => {
        if (err) {
          throw new BadRequestException('file path 가져오기 실패');
        }
        r(url.split('?')[0]);
      }),
    );
    const ext = path.extname(file.originalname);

    const accountFile = this.fileRepository.create({
      accountId: accountId,
      originalFileName: path.basename(file.originalname, ext),
      fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
      fileExt: ext,
      filePath: url,
      fileSize: file.size,
    });

    try {
      // 신규 파일 DB 저장
      await this.fileRepository.save(accountFile);
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * 파일 업데이트 기능
   */
  async updateFile(accountId: number, file: Express.MulterS3.File) {
    const today = getToday();
    const time = getTime();
    const dir = 'account';

    // 기존 파일 조회 후, 삭제
    const oldFiles = await this.fileRepository.findBy({ accountId: accountId });

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];
    for (const file of oldFiles) {
      deleteList.push(file.fileName); // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    }
    deleteList.map((file) => {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file,
      };
      try {
        s3.deleteObject(deleteParams, function (err, data) {
          if (err) {
            console.log('err: ', err);
          } else {
            console.log(data, '정상 삭제 되었습니다.');
          }
        });
      } catch (err) {
        console.log(err);
        throw new BadRequestException('파일 삭제에 실패하였습니다.');
      }
    });
    // DB에 저장되어 있는 기존 파일 삭제
    oldFiles.map((file) => {
      this.fileRepository.delete({ accountFileId: file.accountFileId });
    });

    // S3 업로드
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: file.buffer,
      Key: `${dir}/${today}/${time}_${uuid}`,
    };
    try {
      s3.putObject(uploadParams, function (err, data) {
        if (err) {
          console.log('err: ', err, err.stack);
        } else {
          console.log(data, '정상 업로드 되었습니다.');
        }
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('업로드에 실패하였습니다.');
    }
    // 업로드 된 파일 url 가져오기
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${dir}/${today}/${time}_${uuid}`,
    };
    const url: string = await new Promise((r) =>
      s3.getSignedUrl('getObject', getParams, async (err, url) => {
        if (err) {
          throw new BadRequestException('file path 가져오기 실패');
        }
        r(url.split('?')[0]);
      }),
    );

    const ext = path.extname(file.originalname);

    const accountFile = this.fileRepository.create({
      accountId: accountId,
      originalFileName: path.basename(file.originalname, ext),
      fileName: url.split('com/')[1],
      fileExt: ext,
      filePath: url,
      fileSize: file.size,
    });
    try {
      // 신규 파일 DB 저장
      await this.fileRepository.save(accountFile);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * 파일 삭제 기능
   */
  async deleteFile(accountId: number) {
    const files = await this.fileRepository.findBy({ accountId: accountId });

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];

    for (const file of files) {
      deleteList.push(file.fileName); // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    }

    deleteList.map((file) => {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file,
      };

      try {
        s3.deleteObject(deleteParams, function (err, data) {
          if (err) {
            console.log('err: ', err);
          } else {
            console.log(data, '정상 삭제 되었습니다.');
          }
        });
      } catch (err) {
        console.log(err);
        throw err;
      }
    });
  }
}
