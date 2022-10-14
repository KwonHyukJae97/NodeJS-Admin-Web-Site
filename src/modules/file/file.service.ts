import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { BoardFile } from './entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../board/entities/board';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { getTime, getToday } from '../../common/utils/time-common-method';
import { FileDbInterface } from './file-db.interface';

/**
 * 파일 업로드 시, 필요 로직을 실질적으로 수행
 */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uuid = randomUUID();

// S3 파일 업로드 메서드
async function putObjectS3(
  file: Express.MulterS3.File,
  fileType: string,
  today: string,
  time: string,
) {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: file.buffer,
    Key: `${fileType}/${today}/${time}_${uuid}`,
  };

  try {
    await s3.putObject(uploadParams).promise();
    console.log('정상적으로 업로드 되었습니다.');
  } catch (err) {
    console.log('S3 파일 업로드 실패', err);
    throw new BadRequestException('파일 업로드에 실패하였습니다.');
  }
}

// S3에 업로드 된 파일의 Url 가져오는 메서드
async function getObjectUrlS3(fileType: string, today: string, time: string) {
  const getParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${fileType}/${today}/${time}_${uuid}`,
  };

  const url: string = await new Promise((resolve, reject) =>
    s3.getSignedUrl('getObject', getParams, (err, url) => {
      if (err) {
        reject(new BadRequestException('해당 파일이 존재하지 않습니다.'));
      } else {
        resolve(url.split('?')[0]);
      }
    }),
  );
  return url;
}

// S3 파일 삭제 메서드
async function deleteObjectS3(file) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file,
  };

  try {
    await s3.deleteObject(deleteParams).promise();
    console.log('정상적으로 삭제되었습니다.');
  } catch (err) {
    console.log('S3 파일 삭제 실패', err);
    throw new BadRequestException('파일 삭제에 실패하였습니다.');
  }
}

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  /**
   * 다중 파일 업로드 기능
   */
  async uploadFiles(
    id: number,
    fileType: string,
    files: Express.MulterS3.File[],
    fileDbInterface: FileDbInterface,
  ) {
    if (!files) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      await putObjectS3(file, fileType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(fileType, today, time);

      const ext = path.extname(file.originalname);

      const fileInfo = {
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      };

      // 신규 파일 정보 DB 저장
      await fileDbInterface.save(id, fileInfo);
    });
  }

  /**
   * 다중 파일 업데이트 기능
   */
  async updateFiles(
    id: number,
    fileType: string,
    files: Express.MulterS3.File[],
    fileDbInterface: FileDbInterface,
  ) {
    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      await putObjectS3(file, fileType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(fileType, today, time);

      const ext = path.extname(file.originalname);

      const fileInfo = {
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      };

      // 신규 파일 정보 DB 저장
      await fileDbInterface.save(id, fileInfo);
    });

    // 기존 파일 정보 DB 삭제
    const deleteList = await fileDbInterface.delete(id);

    deleteList.map(async (file) => {
      await deleteObjectS3(file);
    });
  }

  /**
   * 다중 파일 삭제 기능
   */
  async deleteFiles(id: number, fileDbInterface: FileDbInterface) {
    // S3 key값이 담긴 배열 받기
    const deleteList = await fileDbInterface.delete(id);

    // S3에 저장되어 있는 기존 파일 삭제
    deleteList.map(async (file) => {
      await deleteObjectS3(file);
    });
  }
}
