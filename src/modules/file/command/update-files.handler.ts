import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileService } from '../file.service';
import { ConvertException } from '../../../common/utils/convert-exception';
import { BoardFileDb } from '../../board/board-file-db';
import { UpdateFilesCommand } from './update-files.command';

/**
 * 파일 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateFilesCommand)
export class UpdateFilesHandler implements ICommandHandler<UpdateFilesCommand> {
  constructor(
    @Inject(ConvertException) private convertException: ConvertException,
    @Inject('boardFile') private boardFileDb: BoardFileDb,
    private fileService: FileService,
  ) {}

  /**
   * 파일 수정 메소드
   * @param command : 다중 파일 수정에 필요한 파라미터
   * @returns : 파일 수정 실패 시 에러 메시지 반환 / 수정 완료 시 void 반환
   */
  async execute(command: UpdateFilesCommand) {
    const { id, fileType, file, files, fileDbInterface, queryRunner } = command;

    try {
      await this.fileService.updateFiles(id, fileType, file, files, fileDbInterface, queryRunner);
    } catch (err) {
      return this.convertException.badRequestS3Error('수정에', 400);
    }
  }
}
