import { IQuery } from '@nestjs/cqrs';
import { Response } from 'express';

/**
 * 단일 파일 다운로드 시, 사용되는 쿼리 클래스
 */

export class GetFileDownloadQuery implements IQuery {
  constructor(readonly fileId: number, readonly res: Response) {}
}
