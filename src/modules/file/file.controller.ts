import { Controller, Get, Param, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { BoardFile } from './entities/board-file';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFileDownloadQuery } from './query/get-file-download.query';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllFileDownloadQuery } from './query/get-files-download.query';
import { Response } from 'express';

/**
 * 파일 다운로드 API controller
 */
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(BoardFile) private boardFileRepository: Repository<BoardFile>,
    private queryBus: QueryBus,
  ) {}

  /* 수정 예정 */
  /**
   * 단일 파일 다운로드(조회)
   * @Param : board_file_id
   * @Return : 단일 파일 다운로드 쿼리 전송
   */
  @Get(':id')
  downloadFile(@Param('id') fileId: number, @Res() res: Response) {
    const getFileDownloadQuery = new GetFileDownloadQuery(fileId, res);
    return this.queryBus.execute(getFileDownloadQuery);
  }

  /* 수정 예정 */
  /**
   * 다중 파일 다운로드(조회)
   * @Param : board_id
   * @Return : 다중 파일 다운로드 쿼리 전송
   */
  @Get('all/:id')
  downloadZipFile(@Param('id') boardId: number, @Res() res: Response) {
    const getAllFileDownloadQuery = new GetAllFileDownloadQuery(boardId, res);
    return this.queryBus.execute(getAllFileDownloadQuery);
  }
}
