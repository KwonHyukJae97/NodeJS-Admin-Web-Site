import { ICommand } from '@nestjs/cqrs';
import { FileType } from '../entities/file-type.enum';
import { FileDbInterface } from '../file-db.interface';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

/**
 * 파일 수정용 커맨드 정의
 */
export class UpdateFilesCommand implements ICommand {
  constructor(
    readonly id: number,
    readonly fileType: FileType,
    readonly files: Express.MulterS3.File[],
    readonly fileDbInterface: FileDbInterface,
    readonly queryRunner: QueryRunner,
  ) {}
}
