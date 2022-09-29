import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { BoardFile } from './entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Repository } from 'typeorm';
import * as AWS from 'aws-sdk';

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
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  /**
   * 다중 파일 업로드 기능
   */
  async uploadFiles(boardId: number, files: Express.MulterS3.File[]) {
    if (!files) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }
    console.log(files);

    files.map((file) => {
      const ext = path.extname(file.originalname);
      const boardFile = this.fileRepository.create({
        boardId: boardId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: file.key,
        fileExt: ext,
        filePath: file.location,
        fileSize: file.size,
      });

      this.fileRepository.save(boardFile);
    });
  }

  /**
   * 다중 파일 업데이트 기능
   */
  async updateFiles(boardId: number, files: Express.MulterS3.File[]) {
    // 신규 파일 DB 저장
    files.map((file) => {
      const ext = path.extname(file.originalname);
      const boardFile = this.fileRepository.create({
        boardId: boardId,
        originalFileName: path.basename(file.originalname, ext),
        fileName: file.key,
        fileExt: ext,
        filePath: file.location,
        fileSize: file.size,
      });

      this.fileRepository.save(boardFile);
    });

    // 기존 파일 조회 후, 삭제
    const oldFiles = await this.fileRepository.findBy({ boardId: boardId });
    // console.log(oldFiles);

    // S3에 저장되어 있는 기존 파일 삭제
    const deleteList = [];

    for (const file of oldFiles) {
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
    oldFiles.map((file) => {
      this.fileRepository.delete({ boardFileId: file.boardFileId });
    });
  }

  /**
   * 다중 파일 삭제 기능
   */
  async deleteFiles(boardId: number) {
    const files = await this.fileRepository.findBy({ boardId: boardId });

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
