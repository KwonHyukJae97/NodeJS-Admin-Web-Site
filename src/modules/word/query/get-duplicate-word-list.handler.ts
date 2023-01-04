import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Word } from '../entities/word';
import { Example } from '../entities/example';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Page } from '../../../common/utils/page';
import { GetDuplicateWordListQuery } from './get-duplicate-word-list.query';

/**
 * 중복 단어 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetDuplicateWordListQuery)
export class GetDuplicateWordListHandler implements IQueryHandler<GetDuplicateWordListQuery> {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(Example) private exampleRepository: Repository<Example>,
    @InjectRepository(SimilarWord) private similarRepository: Repository<SimilarWord>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 중복 단어 리스트 조회 메소드
   * @param query : 딘어 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 단어 전체 리스트 반환
   */
  async execute(query: GetDuplicateWordListQuery) {
    const { param } = query;

    // 중복 단어 정보 조회 (한 단어에 대한 단어정보/예문정보)
    const word = this.wordRepository
      .createQueryBuilder('word')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('duplicationWord.wordName')
          .from(Word, 'duplicationWord')
          .groupBy('duplicationWord.wordName')
          .having('COUNT(duplicationWord.wordName) > 1')
          .getQuery();
        return 'word.wordName IN' + subQuery;
      })
      .orderBy('word.wordName', 'ASC');

    if (param.searchKey) {
      word.where('word.isAutoMain = :isAutoMain', {
        isAutoMain: param.searchWord,
      });
    }

    let tempQuery = word;

    if (!param.totalData) {
      tempQuery = tempQuery.take(param.getLimit()).skip(param.getOffset());
    }

    const list = await tempQuery.getMany();
    const total = await tempQuery.getCount();
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('단어', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
