import { Inject, Injectable } from '@nestjs/common';
import { FileDbInterface } from '../file/file-db.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ConvertException } from '../../common/utils/convert-exception';
import { Word } from './entities/word';
import { WordFile } from '../file/entities/word-file';

/**
 * 단어 관련 파일 DB 저장/수정/삭제용 인터페이스 구현체
 */
@Injectable()
export class WordFileDb implements FileDbInterface {
  constructor(
    @InjectRepository(Word) private boardRepository: Repository<Word>,
    @InjectRepository(WordFile) private fileRepository: Repository<WordFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 파일 정보 저장 메소드
   * @param id : board_id
   * @param fileInfo : 파일 정보
   * @returns : DB처리 실패 시 에러 메시지 반환 / 저장 성공 시 void 반환
   */
  async save(id: number, fileInfo: any, queryRunner: QueryRunner) {
    const { originalFileName, fileName, fileExt, filePath, fileSize, fieldName } = fileInfo;

    try {
      // 파일 종류에 따른 코드 번호 저장 (00:설명이미지/01:그림이미지/02:음원/03:영상)
      let fileCode;
      if (fieldName.includes('wordDescriptionImage')) {
        fileCode = '00';
      } else if (fieldName.includes('wordPictureImage')) {
        fileCode = '01';
      } else if (fieldName.includes('wordSound')) {
        fileCode = '02';
      }

      const wordFile = queryRunner.manager.getRepository(WordFile).create({
        wordId: id,
        fileCode,
        originalFileName,
        fileName,
        fileExt,
        filePath,
        fileSize,
      });

      await queryRunner.manager.getRepository(WordFile).save(wordFile);
    } catch (err) {
      console.log('DB 파일 저장 실패');
      return this.convertException.badRequestError('단어 파일 정보에', 400);
    }
  }

  /**
   * 파일 정보 삭제 메소드
   * @param id : board_id
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async delete(id: number, queryRunner: QueryRunner) {
    // 기존 파일 조회
    const files = await this.fileRepository.findBy({ wordId: id });

    const deleteList = [];

    // S3 key값으로 사용될 속성 추출 후, 새 배열에 추가
    for (const file of files) {
      deleteList.push(file.fileName);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await this.fileRepository.softDelete({ wordFileId: file.wordFileId });
      }
    } catch (err) {
      console.log('DB 파일 삭제 실패', err);
      return this.convertException.CommonError(500);
    }

    // S3 key값이 담긴 배열 반환
    return deleteList;
  }
}
