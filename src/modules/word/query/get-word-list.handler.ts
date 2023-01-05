import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { GetWordListQuery } from './get-word-list.query';
import { Word } from '../entities/word';
import { Example } from '../entities/example';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Page } from '../../../common/utils/page';
import { WordFile } from '../../file/entities/word-file';

/**
 * 단어 전체 & 검색어에 해당하는 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetWordListQuery)
export class GetWordListHandler implements IQueryHandler<GetWordListQuery> {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(Example) private exampleRepository: Repository<Example>,
    @InjectRepository(SimilarWord) private similarRepository: Repository<SimilarWord>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 단어 전체 리스트 조회 및 검색어 조회 메소드
   * @param query : 딘어 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            검색어가 없을 경우, 조회 성공 시 단어 전체 리스트 반환 /
   *            검색어가 있을 경우, 조회 성공 시 검색어에 포함되는 단어 리스트 반환
   */
  async execute(query: GetWordListQuery) {
    const { param } = query;

    // 단어 정보 조회 (한 단어에 대한 단어정보/예문정보/파일정보/비슷하지만 다른말(단어정보/예문정보/파일정보))
    const word = this.wordRepository
      .createQueryBuilder('word')
      .leftJoinAndMapMany('word.wordFiles', WordFile, 'wordFile', 'word.wordId = wordFile.wordId')
      .leftJoinAndSelect('word.examples', 'example')
      .leftJoin('word.similarWords', 'similarWords')
      .leftJoinAndMapMany(
        'word.similarWords',
        Word,
        'similarWord',
        'similarWords.similarWordId = similarWord.wordId',
      )
      .leftJoinAndMapMany(
        'similarWord.similarWordFiles',
        WordFile,
        'similarWordFile',
        'similarWords.similarWordId = similarWordFile.wordId',
      )
      .leftJoinAndMapMany(
        'similarWord.examples',
        Example,
        'similarExample',
        'similarWords.similarWordId = similarExample.wordId',
      )
      .orderBy('word.wordId', 'DESC');

    // // 검색 키워드가 있을 경우
    // if (param.searchWord) {
    //   notice.andWhere('board.title like :title', { title: `%${param.searchWord}%` });
    // }

    let tempQuery = word;

    // 전체 조회 값이 false일 경우, 페이징 처리
    if (!param.totalData) {
      tempQuery = tempQuery.take(param.getLimit()).skip(param.getOffset());
    }

    // 최종 데이터 반환
    const list = await tempQuery.getMany();
    // 최종 데이터의 총 개수 반환
    const total = await tempQuery.getCount();
    // 전체 조회 값 여부에 따른 pageNo/pageSize 반환값 설정
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('단어', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
