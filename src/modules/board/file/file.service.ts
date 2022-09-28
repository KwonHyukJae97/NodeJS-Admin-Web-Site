import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { BoardFile } from './entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../entities/board';
import { Repository } from 'typeorm';

/**
 * 파일 업로드 시, 필요 로직을 실질적으로 수행
 */

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  // 단일 파일 업로드
  // uploadFile(file: Express.MulterS3.File) {
  //   if (!file) {
  //     throw new BadRequestException('파일이 존재하지 않습니다.');
  //   }
  //   const ext = path.extname(file.originalname);
  //
  //   const boardFile = {
  //     originalFileName: path.basename(file.originalname, ext),
  //     fileName: file.key,
  //     fileExt: ext,
  //     filePath: file.location,
  //     fileSize: file.size,
  //   };
  //
  //   // board_file db에 저장
  //
  //   return boardFile;
  // }

  // 다중 파일 업로드
  async uploadFiles(boardId: number, files: Express.MulterS3.File[]) {
    if (!files) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    // const uploadfiles = [];

    for (const element of files) {
      // const file = new BoardFile();
      const ext = path.extname(element.originalname);

      // file.originalFileName = path.basename(element.originalname, ext);
      // file.fileName = element.key;
      // file.fileExt = ext;
      // file.filePath = element.location;
      // file.fileSize = element.size;

      const boardFile = this.fileRepository.create({
        boardId: boardId,
        originalFileName: path.basename(element.originalname, ext),
        fileName: element.key,
        fileExt: ext,
        filePath: element.location,
        fileSize: element.size,
      });

      await this.fileRepository.save(boardFile);

      // uploadfiles.push(file);
    }
    return '파일 업로드 성공';
  }
}
