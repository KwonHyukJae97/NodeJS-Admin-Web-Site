import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Example } from '../entities/example';
import { Word } from '../entities/word';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { FileType } from '../../file/entities/file-type.enum';
import { WordFileDb } from '../word-file-db';
import { UpdateWordCommand } from './update-word.command';
import { UpdateFilesCommand } from '../../file/command/update-files.command';

/**
 * 단어 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateWordCommand)
export class UpdateWordHandler implements ICommandHandler<UpdateWordCommand> {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(Example) private exampleRepository: Repository<Example>,
    @InjectRepository(SimilarWord) private similarRepository: Repository<SimilarWord>,
    @Inject('wordFile') private wordFileDb: WordFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 단어 수정 메소드
   * @param command : 단어 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 완료 시 단어 정보 반환
   */
  async execute(command: UpdateWordCommand) {
    const {
      wordLevelId,
      projectId,
      wordName,
      mean,
      exampleList,
      wordId,
      isRealWordConnect,
      isMainWord,
      isAutoMain,
      pictureImageFile,
      descImageFile,
      soundFile,
    } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 단어 정보 조회
    const word = await this.wordRepository.findOneBy({ wordId });

    if (!word) {
      return this.convertException.notFoundError('단어', 404);
    }

    // 단어 예문 정보 조회
    const examples = await this.exampleRepository.findBy({ wordId });

    try {
      // 본단어에 연결되어있다면 연결단어 정보 저장
      // if (isRealWordConnect) {
      //   word.connectWordId =
      // }
      word.wordLevelId = wordLevelId;
      word.projectId = projectId;
      word.wordName = wordName;
      word.mean = mean;
      word.wordStatus = isRealWordConnect ? '2' : '1';
      word.isMainWord = isMainWord;
      word.isAutoMain = isAutoMain;

      await queryRunner.manager.getRepository(Word).save(word);

      // 단어에 대한 파일 정보 수정
      if (pictureImageFile) {
        const command = new UpdateFilesCommand(
          word.wordId,
          FileType.WORD,
          pictureImageFile,
          null,
          this.wordFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }

      if (descImageFile) {
        const command = new UpdateFilesCommand(
          word.wordId,
          FileType.WORD,
          descImageFile,
          null,
          this.wordFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }

      if (soundFile) {
        const command = new UpdateFilesCommand(
          word.wordId,
          FileType.WORD,
          soundFile,
          null,
          this.wordFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }

      // 단어에 대한 예문 정보 수정
      // example dto에 exampleId가 없으면 신규 등록
      // example dto에 exampleId가 있다면 수정
      // example db의 데이터 중 example dto의 exampleId가 일치하는게 없다면 삭제
      let result;
      for (const exampleInfo of exampleList) {
        if (!exampleInfo.exampleId) {
          // 신규 등록
          const newExample = queryRunner.manager.getRepository(Example).create({
            wordId: word.wordId,
            sentence: exampleInfo.sentence,
            translation: exampleInfo.translation,
            source: exampleInfo.source,
            exampleSequence: exampleInfo.exampleSequence,
          });

          await queryRunner.manager.getRepository(Example).save(newExample);
        } else if (exampleInfo.exampleId) {
          // 수정
          for (const example of examples) {
            if (example.exampleId == exampleInfo.exampleId) {
              const editExample = await this.exampleRepository.findOneBy({
                exampleId: exampleInfo.exampleId,
              });
              editExample.sentence = exampleInfo.sentence;
              editExample.translation = exampleInfo.translation;
              editExample.source = exampleInfo.source;
              editExample.exampleSequence = exampleInfo.exampleSequence;

              await queryRunner.manager.getRepository(Example).save(editExample);
            }
          }
        } else {
          // 일치하지 않은 exampleId 추출
          examples.map((ex) => {
            return (result = ex.exampleId !== exampleInfo.exampleId);
          });

          // 삭제
          for (const example of result) {
            await queryRunner.manager
              .getRepository(Example)
              .delete({ exampleId: example.exampleId });
          }
          console.log('result', result);
        }
      }

      // for (const exampleInfo of exampleList) {
      //   const example = queryRunner.manager.getRepository(Example).create({
      //     wordId: word.wordId,
      //     sentence: exampleInfo.sentence,
      //     translation: exampleInfo.translation,
      //     source: exampleInfo.source,
      //     exampleSequence: exampleInfo.exampleSequence,
      //   });
      //   await queryRunner.manager.getRepository(Example).save(example);
      // }

      if (wordId) {
        // 비슷하지만 다른말 정보 저장
        const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
          wordId,
          similarWordId: word.wordId,
        });
        await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);
      }

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
