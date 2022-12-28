import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFilesCommand } from './create-files.command';
import { FileService } from '../file.service';
import { ConvertException } from '../../../common/utils/convert-exception';

/**
 * 파일 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateFilesCommand)
export class CreateFilesHandler implements ICommandHandler<CreateFilesCommand> {
  constructor(
    @Inject(ConvertException) private convertException: ConvertException,
    private fileService: FileService,
  ) {}

  /**
   * 파일 등록 메소드
   * @param command : 다중 파일 등록에 필요한 파라미터
   * @returns : 파일 등록 실패 시 에러 메시지 반환 / 등록 완료 시 공지사항 정보 반환
   */
  async execute(command: CreateFilesCommand) {
    const { id, fileType, files, fileDbInterface, queryRunner } = command;

    try {
      await this.fileService.uploadFiles(id, fileType, files, fileDbInterface, queryRunner);
    } catch (err) {
      return this.convertException.badRequestS3Error('등록에', 400);
    }
  }
}
