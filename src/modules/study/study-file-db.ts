import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { StudyFile } from '../file/entities/study-file';
import { FileDbInterface } from '../file/file-db.interface';
import { Study } from './entities/study';

/**
 * 학습관리 관련 파일 DB 저장/수정/삭제용 인터페이스 구현체
 */
@Injectable()
export class StudyFileDb implements FileDbInterface {
  constructor(
    @InjectRepository(Study) private studyRepository: Repository<Study>,
    @InjectRepository(StudyFile) private fileRepository: Repository<StudyFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 파일 정보 저장 메소드
   * @param id : study_id
   * @param fileInfo : 파일정보
   * @returns : DB 처리 실패 시 에러 메시지 반환 / 저장 성공 시 void 반환
   */
  async save(id: number, fileInfo: any) {
    const { originalFileName, fileName, fileExt, filePath, fileSize } = fileInfo;

    const studyFile = this.fileRepository.create({
      studyId: id,
      originalFileName,
      fileName,
      fileExt,
      filePath,
      fileSize,
    });

    try {
      await this.fileRepository.save(studyFile);
    } catch (err) {
      console.log('DB 파일 저장 실패');
      return this.convertException.badRequestError('학습관리 파일 정보에', 400);
    }
  }

  /**
   * 파일 정보 삭제 메소드
   * @param id : study_id
   * @returns : DB 처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async delete(id: number) {
    const file = await this.fileRepository.findOneBy({ studyId: id });

    if (file) {
      const deleteFile = file.fileName;

      try {
        await this.fileRepository.softDelete({ studyFileId: file.studyFileId });
      } catch (err) {
        console.log('DB 파일 삭제 실패', err);
        return this.convertException.CommonError(500);
      }
      return deleteFile;
    }
  }
}
