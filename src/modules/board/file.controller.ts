import { Controller } from '@nestjs/common';
import { FileService } from './file/file.service';
import { BoardFile } from './file/entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * 파일 업로드 테스트 전용 컨트롤러 (삭제 예정)
 */

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(BoardFile)
    private boardFileRepository: Repository<BoardFile>,
  ) {}

  // 단일 파일 업로드 API
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
  //
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

  // 다중 파일 업로드 API
  // @Post('upload')
  // @UseInterceptors(FilesInterceptor('files', 3))
  // async uploadFiles(@UploadedFiles() files: Express.MulterS3.File[]) {
  //   console.log(files);
  //   return this.fileService.uploadFiles(files);
  // }
  //
  // @Get('/list')
  // getFile(): Promise<BoardFile[]> {
  //   return this.boardFileRepository.find();
  // }
}
