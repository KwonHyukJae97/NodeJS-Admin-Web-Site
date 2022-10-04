import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AccountFile } from './entities/account-file';

/**
 * 파일 업로드 시, 필요 로직을 실질적으로 수행
 */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

@Injectable()
export class FileService {
  constructor(@InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>) {}

  /**
   * 파일 업로드 기능
   */
  async uploadFile(accountId: number, file: Express.MulterS3.File[]) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    console.log(file);

    file.map(async (file) => {
      const ext = path.extname(file.originalname);
      const accountFile = this.fileRepository.create({
        accountId: accountId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: file.key,
        fileExt: ext,
        filePath: file.location,
        fileSize: file.size,
      });

      this.fileRepository.save(accountFile);
    });
  }

  /**
   * 파일 업데이트 기능
   */
  async updateFile(accountId: number, file: Express.MulterS3.File[]) {
    // 신규 파일 DB 저장
    file.map((file) => {
      const ext = path.extname(file.originalname);

      const accountFile = this.fileRepository.create({
        accountId: accountId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: file.key,
        fileExt: ext,
        filePath: file.location,
        fileSize: file.size,
      });
      this.fileRepository.save(accountFile);
    });

    // 기존 파일 조회 후, 삭제
    const oldFile = await this.fileRepository.findBy({ accountId: accountId });
    // console.log(oldFiles);

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];

    for (const file of oldFile) {
      // console.log(file.fileName);
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

    // DB에 저장되어 있는 기존 파일 삭제
    oldFile.map((file) => {
      this.fileRepository.delete({ accountFileId: file.accountFileId });
    });
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
