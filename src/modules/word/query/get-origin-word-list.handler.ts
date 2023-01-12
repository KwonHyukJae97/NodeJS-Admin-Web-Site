import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Word } from '../entities/word.entity';
import { Example } from '../entities/example.entity';
import { SimilarWord } from '../entities/similar-word.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { WordFile } from '../../file/entities/word-file.entity';
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
    const word = await this.wordRepository
      .createQueryBuilder('word')
      .where('word.wordName like :wordName', { wordName: `${param['wordName']}` })
      .andWhere(
        new Brackets((qb) => {
          qb.where('word.wordStatus like :wordStatus0', { wordStatus0: '0' }).orWhere(
            'word.wordStatus like :wordStatus1',
            { wordStatus1: '1' },
          );
        }),
      )
      .leftJoinAndSelect('word.examples', 'example')
      .leftJoinAndMapMany('word.wordFiles', WordFile, 'wordFile', 'word.wordId = wordFile.wordId')
      .orderBy('word.wordStatus', 'ASC')
      .addOrderBy('word.wordId', 'DESC')
      .getMany();

    return word;
  }
}
