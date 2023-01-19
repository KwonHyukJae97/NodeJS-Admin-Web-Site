import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GetAllWordLevelQuery } from './get-all-wordLevel-list.query';
import { WordLevel } from '../entities/wordLevel.entity';

/**
 * 단어레벨 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllWordLevelQuery)
export class GetAllWordLevelQueryHandler implements IQueryHandler<GetAllWordLevelQuery> {
  constructor(
    @InjectRepository(WordLevel) private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 단어레벨 리스트 조회 메소드
   * @param query : 단어레벨 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 단어레벨 리스트 반환
   */
  async execute(query: GetAllWordLevelQuery) {
    const wordLevel = await this.wordLevelRepository.find({});
    if (!wordLevel) {
      return this.convertException.notFoundError('단어레벨', 404);
    }
    console.log(wordLevel);
    return wordLevel;
  }
}
