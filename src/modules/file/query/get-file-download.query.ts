import { IQuery } from '@nestjs/cqrs';
import { Response } from 'express';

/**
 * 단일 파일 다운로드(조회)용 쿼리
 */
export class GetFileDownloadQuery implements IQuery {
  constructor(readonly fileId: number, readonly res: Response) {}
}
