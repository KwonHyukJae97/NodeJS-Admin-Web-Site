import { FileDbInterface } from '../file/file-db.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board';
import { Repository } from 'typeorm';
import { BoardFile } from '../file/entities/board-file';
import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * 게시판 관련 파일 DB 저장/수정/삭제용 인터페이스 구현체
 */
@Injectable()
export class BoardFileDb implements FileDbInterface {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  // DB 파일 정보 저장하는 메서드
  async save(id: number, fileInfo: any) {
    const { originalFileName, fileName, fileExt, filePath, fileSize } = fileInfo;

    const boardFile = this.fileRepository.create({
      boardId: id,
      originalFileName,
      fileName,
      fileExt,
      filePath,
      fileSize,
    });

    try {
      await this.fileRepository.save(boardFile);
    } catch (err) {
      console.log('DB 파일 저장 실패');
      throw new BadRequestException('파일 저장에 실패하였습니다.');
    }
  }

  // DB 파일 정보 삭제하는 메서드
  async delete(id: number) {
    // 기존 파일 조회
    const files = await this.fileRepository.findBy({ boardId: id });

    const deleteList = [];

    // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    for (const file of files) {
      deleteList.push(file.fileName);
    }

    try {
      files.map(async (file) => {
        await this.fileRepository.softDelete({ boardFileId: file.boardFileId });
      });
    } catch (err) {
      console.log('DB 파일 삭제 실패', err);
      throw new BadRequestException('파일 삭제에 실패하였습니다.');
    }

    // S3 key값이 담긴 배열 반환
    return deleteList;
  }

  async initSave(id: number) {}
}
