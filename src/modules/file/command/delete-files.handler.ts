import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileService } from '../file.service';
import { ConvertException } from '../../../common/utils/convert-exception';
import { BoardFileDb } from '../../board/board-file-db';
import { DeleteFilesCommand } from './delete-files.command';

/**
 * 파일 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteFilesCommand)
export class DeleteFilesHandler implements ICommandHandler<DeleteFilesCommand> {
  constructor(
    @Inject(ConvertException) private convertException: ConvertException,
    @Inject('boardFile') private boardFileDb: BoardFileDb,
    private fileService: FileService,
  ) {}

  /**
   * 파일 삭제 메소드
   * @param command : 다중 파일 삭제에 필요한 파라미터
   * @returns : 파일 삭제 실패 시 에러 메시지 반환 / 삭제 완료 시 void 반환
   */
  async execute(command: DeleteFilesCommand) {
    const { id, fileDbInterface, queryRunner } = command;

    try {
      await this.fileService.deleteFiles(id, fileDbInterface, queryRunner);
    } catch (err) {
      return this.convertException.badRequestS3Error('삭제에', 400);
    }
  }
}
