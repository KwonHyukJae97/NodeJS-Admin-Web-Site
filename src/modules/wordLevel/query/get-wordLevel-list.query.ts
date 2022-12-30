import { IQuery } from '@nestjs/cqrs';
import { GetWordLevelRequestDto } from '../dto/get-wordLevel-request.dto';

/**
 * 단어레벨 전체 리스트 조회 쿼리
 */
export class GetWordLevelListQuery implements IQuery {
  constructor(readonly param: GetWordLevelRequestDto) {}
}
