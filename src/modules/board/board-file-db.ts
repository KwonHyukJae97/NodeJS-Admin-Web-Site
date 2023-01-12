import { FileDbInterface } from '../file/file-db.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { QueryRunner, Repository } from 'typeorm';
import { BoardFile } from '../file/entities/board-file.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ConvertException } from '../../common/utils/convert-exception';

/**
 * 게시판 관련 파일 DB 저장/수정/삭제용 인터페이스 구현체
 */
@Injectable()
export class BoardFileDb implements FileDbInterface {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 파일 정보 저장 메소드
   * @param id : board_id
   * @param fileInfo : 파일 정보
   * @returns : DB처리 실패 시 에러 메시지 반환 / 저장 성공 시 void 반환
   */
  async save(id: number, fileInfo: any, queryRunner: QueryRunner) {
    const { originalFileName, fileName, fileExt, filePath, fileSize } = fileInfo;

    try {
      const boardFile = queryRunner.manager.getRepository(BoardFile).create({
        boardId: id,
        originalFileName,
        fileName,
        fileExt,
        filePath,
        fileSize,
      });

      await queryRunner.manager.getRepository(BoardFile).save(boardFile);
    } catch (err) {
      console.log('DB 파일 저장 실패');
      return this.convertException.badRequestError('게시글 파일 정보에', 400);
    }
  }

  /**
   * 파일 정보 삭제 메소드
   * @param id : board_id
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async delete(id: number, fieldName: null, queryRunner: QueryRunner) {
    // 기존 파일 조회
    const files = await this.fileRepository.findBy({ boardId: id });

    const deleteList = [];

    // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    for (const file of files) {
      deleteList.push(file.fileName);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await this.fileRepository.softDelete({ boardFileId: file.boardFileId });
      }
    } catch (err) {
      console.log('DB 파일 삭제 실패', err);
      return this.convertException.CommonError(500);
    }

    // S3 key값이 담긴 배열 반환
    return deleteList;
  }
}
