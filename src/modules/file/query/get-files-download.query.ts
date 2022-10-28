import { IQuery } from '@nestjs/cqrs';
import { Response } from 'express';

/**
 * 다중 파일 다운로드(조회)용 쿼리
 */
export class GetAllFileDownloadQuery implements IQuery {
  constructor(readonly boardId: number, readonly res: Response) {}
}
