import { IQuery } from '@nestjs/cqrs';
import { Response } from 'express';

/**
 * 다중 파일 다운로드 시, 사용되는 쿼리 클래스
 */

export class GetAllFileDownloadQuery implements IQuery {
  constructor(readonly boardId: number, readonly res: Response) {}
}
