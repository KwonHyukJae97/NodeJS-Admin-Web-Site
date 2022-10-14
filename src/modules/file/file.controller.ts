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
 * 파일 다운로드 관련 API 처리하는 컨트롤러
 */

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,

    @InjectRepository(BoardFile)
    private boardFileRepository: Repository<BoardFile>,

    private queryBus: QueryBus,
  ) {}

  /**
   * 단일 파일 다운로드
   * @ param : board_file_id
   */
  @Get(':id')
  downloadFile(@Param('id') fileId: number, @Res() res: Response) {
    const getFileDownloadQuery = new GetFileDownloadQuery(fileId, res);
    return this.queryBus.execute(getFileDownloadQuery);
  }

  /**
   * 다중 파일 다운로드 (압축)
   * @ param : board_id
   */
  @Get('all/:id')
  downloadZipFile(@Param('id') boardId: number, @Res() res: Response) {
    const getAllFileDownloadQuery = new GetAllFileDownloadQuery(boardId, res);
    return this.queryBus.execute(getAllFileDownloadQuery);
  }
}
