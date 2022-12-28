import { ICommand } from '@nestjs/cqrs';
import { FileDbInterface } from '../file-db.interface';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

/**
 * 파일 삭제용 커맨드 정의
 */
export class DeleteFilesCommand implements ICommand {
  constructor(
    readonly id: number,
    readonly fileDbInterface: FileDbInterface,
    readonly queryRunner: QueryRunner,
  ) {}
}
