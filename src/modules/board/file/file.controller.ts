import { Controller, Get, Param, Response } from '@nestjs/common';
import { FileService } from './file.service';
import { BoardFile } from './entities/board_file';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFileDownloadQuery } from './query/get-file-download.query';
import { QueryBus } from '@nestjs/cqrs';

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
  downloadFile(@Param('id') fileId: number, @Response() res) {
    const getFileDownloadQuery = new GetFileDownloadQuery(fileId, res);
    return this.queryBus.execute(getFileDownloadQuery);
  }
}
