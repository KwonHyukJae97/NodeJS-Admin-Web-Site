import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { StudyPlanFile } from '../file/entities/studyPlan-file.entity';
import { FileDbInterface } from '../file/file-db.interface';
import { StudyPlan } from './entities/studyPlan.entity';

/**
 * 학습 구성 관현 파일 DB 저장/수정/삭제용 인터페이스 구현체
 */
@Injectable()
export class StudyPlanFileDb implements FileDbInterface {
  constructor(
    @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(StudyPlanFile) private fileRepository: Repository<StudyPlanFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async save(id: number, fileInfo: any) {
    const { originalFileName, fileName, fileExt, filePath, fileSize } = fileInfo;

    const studyPlanFile = this.fileRepository.create({
      studyPlanId: id,
      originalFileName,
      fileName,
      fileExt,
      filePath,
      fileSize,
    });

    try {
      await this.fileRepository.save(studyPlanFile);
    } catch (err) {
      console.log('DB 파일 저장 실패', err);
      return this.convertException.badRequestError('학습구성 파일 정보에', 400);
    }
  }

  async delete(id: number) {
    const file = await this.fileRepository.findOneBy({ studyPlanId: id });

    if (file) {
      const deleteFile = file.fileName;

      try {
        await this.fileRepository.softDelete({ studyPlanFileId: file.studyPlanFileId });
      } catch (err) {
        console.log('DB 파일 삭제 실패', err);
        return this.convertException.CommonError(500);
      }
      return deleteFile;
    }
  }
}
