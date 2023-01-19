import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Page } from 'src/common/utils/page';
import { Repository } from 'typeorm';
import { WordLevel } from '../entities/wordLevel.entity';
import { GetWordLevelListQuery } from './get-wordLevel-list.query';

/**
 * 단어레벨 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetWordLevelListQuery)
export class GetWordLevelListQueryHandler implements IQueryHandler<GetWordLevelListQuery> {
  constructor(
    @InjectRepository(WordLevel) private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetWordLevelListQuery) {
    const { param } = query;

    const wordLevel = await this.wordLevelRepository
      .createQueryBuilder('wordLevel')
      .select([
        `wordLevel.wordLevelId AS wordLevelId,
      wordLevel.wordLevelName AS wordLevelName,
      wordLevel.wordLevelSequence AS wordLevelSequence,
      wordLevel.isService AS isService,
      wordLevel.regBy AS regBy`,
      ])
      .orderBy('wordLevel.wordLevelId', 'DESC');

    if (param.searchWord) {
      wordLevel.where('wordLevel.wordLevelName like :wordLevelName', {
        wordLevelName: `%${param.searchWord}%`,
      });
    }
    let tempQuery = wordLevel;

    // 전체 조회 값이 false일 경우, 페이징 처리
    if (!param.totalData) {
      tempQuery = tempQuery.limit(param.getLimit()).offset(param.getOffset());
    }
    // 최종 데이터 반환
    const list = await tempQuery.getRawMany();
    // 최종 데이터의 총 개수 반환
    const total = await tempQuery.getCount();

    // 전체 조회 값 여부에 따른 pageNo/pageSize 반환값 설정
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('단어레벨 ', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
