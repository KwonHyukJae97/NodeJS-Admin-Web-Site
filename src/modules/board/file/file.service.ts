import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { BoardFile } from './entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { getTime, getToday } from '../../../common/utils/time-common-method';

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
function putObjectS3(file: Express.MulterS3.File, boardType: string, today: string, time: string) {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: file.buffer,
    Key: `${boardType}/${today}/${time}_${uuid}`,
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
}

// S3에 업로드 된 파일의 Url 가져오는 메서드
async function getObjectUrlS3(boardType: string, today: string, time: string) {
  const getParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${boardType}/${today}/${time}_${uuid}`,
  };

  const url: string = await new Promise((r) =>
    s3.getSignedUrl('getObject', getParams, async (err, url) => {
      if (err) {
        throw new BadRequestException('file path 가져오기 실패');
      }
      r(url.split('?')[0]);
    }),
  );
  return url;
}

// S3 파일 삭제 메서드
function deleteObjectS3(file) {
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
  async uploadFiles(boardId: number, boardType: string, files: Express.MulterS3.File[]) {
    if (!files) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      putObjectS3(file, boardType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(boardType, today, time);

      const ext = path.extname(file.originalname);

      const boardFile = this.fileRepository.create({
        boardId: boardId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      });

      try {
        await this.fileRepository.save(boardFile);
      } catch (err) {
        console.log(err);
      }
    });
  }

  /**
   * 다중 파일 업데이트 기능
   */
  async updateFiles(boardId: number, boardType: string, files: Express.MulterS3.File[]) {
    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      putObjectS3(file, boardType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(boardType, today, time);

      const ext = path.extname(file.originalname);

      const boardFile = this.fileRepository.create({
        boardId: boardId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1],
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      });

      try {
        // 신규 파일 DB 저장
        await this.fileRepository.save(boardFile);
      } catch (err) {
        console.log(err);
      }
    });

    // 기존 파일 조회 후, 삭제
    const oldFiles = await this.fileRepository.findBy({ boardId: boardId });

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];

    for (const file of oldFiles) {
      deleteList.push(file.fileName); // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    }

    deleteList.map((file) => {
      deleteObjectS3(file);
    });

    // DB에 저장되어 있는 기존 파일 삭제
    oldFiles.map((file) => {
      this.fileRepository.delete({ boardFileId: file.boardFileId });
    });
  }

  /**
   * 다중 파일 삭제 기능
   */
  async deleteFiles(boardId: number) {
    const files = await this.fileRepository.findBy({ boardId: boardId });

    console.log(files.length);

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];

    for (const file of files) {
      deleteList.push(file.fileName); // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    }

    console.log(deleteList);

    deleteList.map((file) => {
      deleteObjectS3(file);
    });
  }
}
