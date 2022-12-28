import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateWordCommand } from './create-word.command';
import { Example } from '../entities/example';
import { Word } from '../entities/word';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';

/**
 * 단어 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateWordCommand)
export class CreateWordHandler implements ICommandHandler<CreateWordCommand> {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(Example) private exampleRepository: Repository<Example>,
    @InjectRepository(SimilarWord) private similarRepository: Repository<SimilarWord>,
    // @Inject('boardFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 단어 등록 메소드
   * @param command : 단어 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 단어 정보 반환
   */
  async execute(command: CreateWordCommand) {
    const {
      wordLevelId,
      projectId,
      wordName,
      mean,
      exampleList,
      similarInfoList,
      isRealWordConnect,
      account,
      files,
    } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 단어 정보 저장
      const word = queryRunner.manager.getRepository(Word).create({
        wordLevelId,
        projectId,
        wordName,
        mean,
        // 본단어와 연결되어 있으면 '연결된 단어' 아니면 '일반 단어'
        wordStatus: isRealWordConnect ? '2' : '1',
        isMainWord: true,
        isAutoMain: true,
      });

      await queryRunner.manager.getRepository(Word).save(word);

      // 단어에 대한 예문 정보 저장
      exampleList.map(async (exampleInfo) => {
        const example = queryRunner.manager.getRepository(Example).create({
          wordId: word.wordId,
          sentence: exampleInfo.sentence,
          translation: exampleInfo.translation,
          source: exampleInfo.source,
          exampleSequence: exampleInfo.exampleSequence,
        });

        await queryRunner.manager.getRepository(Example).save(example);
      });

      similarInfoList.map(async (similarInfo) => {
        // 단어에 대한 비슷하지만 다른말 정보가 기존 db에 있는지 조회
        const similarWordList = await this.wordRepository
          .createQueryBuilder('similar')
          .where('similar.wordName = :wordName', { wordName: similarInfo.wordName })
          .getMany();

        // 비슷하지만 다른말 단어 정보 저장 (신규일 경우)
        if (similarWordList.length != 0) {
          const similarWord = queryRunner.manager.getRepository(Word).create({
            wordLevelId: similarInfo.wordLevelId,
            projectId: similarInfo.projectId,
            wordName: similarInfo.wordName,
            mean: similarInfo.mean,
            wordStatus: '1',
            isMainWord: true,
            isAutoMain: true,
          });

          await queryRunner.manager.getRepository(Word).save(similarWord);

          // 비슷하지만 다른말 정보 저장
          const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
            wordId: word.wordId,
            similarWordId: similarWord.wordId,
          });

          await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);

          // 비슷하지만 다른말에 대한 예문 정보 저장
          similarInfo.exampleList.map(async (similarExampleInfo) => {
            const similarExample = queryRunner.manager.getRepository(Example).create({
              wordId: similarWord.wordId,
              sentence: similarExampleInfo.sentence,
              translation: similarExampleInfo.translation,
              source: similarExampleInfo.source,
              exampleSequence: similarExampleInfo.exampleSequence,
            });

            await queryRunner.manager.getRepository(Example).save(similarExample);
          });
        }
      });

      await queryRunner.commitTransaction();
      return word;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('단어 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
