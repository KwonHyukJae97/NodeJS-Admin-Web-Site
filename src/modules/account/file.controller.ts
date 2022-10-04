import { Controller, Get, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import AWS from 'aws-sdk';
import { Repository } from 'typeorm';
import { FileService } from '../board/file.service';
import { AccountFile } from './file/entities/account-file';

/**
 * 파일 업로드 테스트 전용 컨트롤러 (삭제 예정)
 */
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(AccountFile)
    private AccountFileRepository: Repository<AccountFile>,
  ) {}

  //단일 파일 업로드 API
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file: Express.MulterS3.File) {
  //   return this.fileService.uploadFile(file);
  // }

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
