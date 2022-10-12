import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import AWS from 'aws-sdk';
import { Repository } from 'typeorm';
import { FileService } from './file.service';
import { AccountFile } from './entities/account-file';
import { EventBus } from '@nestjs/cqrs';
import { FileCreateEvent } from 'src/modules/user/event/file-create-event';
import { TestEvent } from 'src/modules/user/event/test.event';

/**
 * 파일 업로드 테스트 전용 컨트롤러 (삭제 예정)
 */
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(AccountFile)
    private AccountFileRepository: Repository<AccountFile>,
    private eventBus: EventBus,
  ) {}

  //단일 파일 업로드 API
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.MulterS3.File, @Body() accountId: number) {
    //return this.fileService.uploadFile(accountId, file);
    // 파일 업데이트 이벤트 처리
    accountId = 1;
    this.eventBus.publish(new FileCreateEvent(accountId, file));
    this.eventBus.publish(new TestEvent());
  }

  // @Patch('update')
  // @UseInterceptors(FileInterceptor('test'))
  // async uploadFileTest(@UploadedFile() test: Express.Multer.File) {
  //   try {
  //     const deleteFile = await new AWS.S3()
  //       .deleteObject({
  //         Key: '1664326437930' + test.originalname,
  //         Bucket: 'b2c-board-test',
  //       })
  //       .promise();
  //     console.log(deleteFile);
  //   } catch (e) {
  //     console.log(e);
  //   }

  //   try {
  //     const updateFile = await new AWS.S3()
  //       .putObject({
  //         Key: `${Date.now() + test.originalname}`,
  //         Bucket: 'b2c-board-test',
  //       })
  //       .promise();
  //     console.log(updateFile);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // @Get('/list')
  // getFile(): Promise<AccountFile[]> {
  //   return this.boardFileRepository.find();
  // }
}
