import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Word } from '../entities/word';
import { Example } from '../entities/example';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { Page } from '../../../common/utils/page';
import { WordFile } from '../../file/entities/word-file';
import { GetOriginWordListQuery } from './get-origin-word-list.query';

/**
 * 본단어/일반단어 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetOriginWordListQuery)
export class GetOriginWordListHandler implements IQueryHandler<GetOriginWordListQuery> {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(Example) private exampleRepository: Repository<Example>,
    @InjectRepository(SimilarWord) private similarRepository: Repository<SimilarWord>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 본단어/일반단어 리스트 조회 메소드
   * @param query : 본딘어 상세 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            조회 성공 시 본단어 상세 정보 반환
   */
  async execute(query: GetOriginWordListQuery) {
    const { param } = query;

    // 본단어 정보 조회 (한 단어에 대한 단어정보/예문정보/파일정보)
    const word = this.wordRepository
      .createQueryBuilder('word')
      .where('word.wordName like :wordName', { wordName: `%${param.searchWord}%` })
      .andWhere(
        new Brackets((qb) => {
          qb.where('word.wordStatus like :wordStatus', { wordStatus: '0' }).orWhere(
            'word.wordStatus like :wordStatus',
            { wordStatus: '1' },
          );
        }),
      )
      .leftJoinAndSelect('word.examples', 'example')
      .leftJoinAndMapMany('word.wordFiles', WordFile, 'wordFile', 'word.wordId = wordFile.wordId')
      .orderBy('word.wordId', 'DESC');

    // 검색
    // if (param.searchKey === '') {
    //   word.andWhere('board.title like :title', { title: `%${param.searchWord}%` });
    // }

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
