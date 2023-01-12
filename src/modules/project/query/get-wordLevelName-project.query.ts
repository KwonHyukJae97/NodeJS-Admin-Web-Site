import { IQuery } from '@nestjs/cqrs';
import { GetProjectRequestDto } from '../dto/get-project-request.dto';

/**
 * 프로젝트 전체 리스트 조회 쿼리 정의
 */
export class GetWordLevelNameProjcetQuery implements IQuery {
  constructor(readonly wordLevelName: string, readonly param: GetProjectRequestDto) {}
}
