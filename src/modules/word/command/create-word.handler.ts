import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateWordCommand } from './create-word.command';
import { Example } from '../entities/example';
import { Word } from '../entities/word';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { CreateFilesCommand } from '../../file/command/create-files.command';
import { FileType } from '../../file/entities/file-type.enum';
import { WordFileDb } from '../word-file-db';

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
    @Inject('wordFile') private wordFileDb: WordFileDb,
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
    const { createWordDto, files } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 파일별 key를 통해 file 객체 할당
      const findKeyFile = (elementKey) => {
        return files
          .filter((file) => {
            return file.fieldname == elementKey;
          })
          .pop();
      };

      // 단어 저장 함수
      // const saveWord = async (
      //   wordLevelId,
      //   projectId,
      //   wordName,
      //   mean,
      //   exampleList,
      //   isRealWordConnect,
      //   pictureImageFile,
      //   descImageFile,
      //   soundFile,
      //   wordId,
      // ) => {
      //   // 단어 정보 저장
      //   const word = queryRunner.manager.getRepository(Word).create({
      //     wordLevelId,
      //     projectId,
      //     wordName,
      //     mean,
      //     // 본단어와 연결되어 있으면 '연결된 단어' 아니면 '일반 단어'
      //     wordStatus: isRealWordConnect ? '2' : '1',
      //     isMainWord: true,
      //     isAutoMain: true,
      //   });
      //
      //   await queryRunner.manager.getRepository(Word).save(word);
      //
      //   // 단어에 대한 파일 정보 저장
      //   if (pictureImageFile) {
      //     const command = new CreateFilesCommand(
      //       word.wordId,
      //       FileType.WORD,
      //       pictureImageFile,
      //       null,
      //       this.wordFileDb,
      //       queryRunner,
      //     );
      //     await this.commandBus.execute(command);
      //   }
      //
      //   if (descImageFile) {
      //     const command = new CreateFilesCommand(
      //       word.wordId,
      //       FileType.WORD,
      //       descImageFile,
      //       null,
      //       this.wordFileDb,
      //       queryRunner,
      //     );
      //     await this.commandBus.execute(command);
      //   }
      //
      //   if (soundFile) {
      //     const command = new CreateFilesCommand(
      //       word.wordId,
      //       FileType.WORD,
      //       soundFile,
      //       null,
      //       this.wordFileDb,
      //       queryRunner,
      //     );
      //     await this.commandBus.execute(command);
      //   }
      //
      //   // 단어에 대한 예문 정보 저장
      //   for (const exampleInfo of exampleList) {
      //     const example = queryRunner.manager.getRepository(Example).create({
      //       wordId: word.wordId,
      //       sentence: exampleInfo.sentence,
      //       translation: exampleInfo.translation,
      //       source: exampleInfo.source,
      //       exampleSequence: exampleInfo.exampleSequence,
      //     });
      //     await queryRunner.manager.getRepository(Example).save(example);
      //   }
      //
      //   if (wordId) {
      //     // 비슷하지만 다른말 정보 저장
      //     const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
      //       wordId,
      //       similarWordId: word.wordId,
      //     });
      //     await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);
      //   }
      //
      //   return word;
      // };

      for (let i = 0; i < createWordDto['createWordDto'].length; i++) {
        const pictureImageFile = findKeyFile(createWordDto['createWordDto'][i].pictureImageFileKey);
        const descImageFile = findKeyFile(createWordDto['createWordDto'][i].descImageFileKey);
        const soundFile = findKeyFile(createWordDto['createWordDto'][i].soundFileKey);

        const word = await saveWord(
          createWordDto['createWordDto'][i].wordLevelId,
          createWordDto['createWordDto'][i].projectId,
          createWordDto['createWordDto'][i].wordName,
          createWordDto['createWordDto'][i].mean,
          createWordDto['createWordDto'][i].exampleList,
          createWordDto['createWordDto'][i].isRealWordConnect,
          pictureImageFile,
          descImageFile,
          soundFile,
          null,
          queryRunner,
          this.wordFileDb,
          this.commandBus,
        );

        // 비슷하지만 다른말에 대한 정보 조회 후 신규일 경우 단어 저장 (단어 저장과 동일한 로직)
        if (createWordDto['createWordDto'][i].similarInfoList) {
          for (const similarInfo of createWordDto['createWordDto'][i].similarInfoList) {
            // 단어에 대한 비슷하지만 다른말 정보가 기존 db에 있는지 조회
            const similarWord = await this.wordRepository
              .createQueryBuilder('similar')
              .where(
                new Brackets((qb) =>
                  qb
                    .where('similar.wordName like :wordName', {
                      wordName: `%${similarInfo.wordName}%`,
                    })
                    .andWhere('similar.mean like :mean', { mean: `%${similarInfo.mean}%` }),
                ),
              )
              .getOne();

            if (!similarWord) {
              const pictureImageFile = findKeyFile(similarInfo.pictureImageFileKey);
              const descImageFile = findKeyFile(similarInfo.descImageFileKey);
              const soundFile = findKeyFile(similarInfo.soundFileKey);

              await saveWord(
                similarInfo.wordLevelId,
                similarInfo.projectId,
                similarInfo.wordName,
                similarInfo.mean,
                similarInfo.exampleList,
                similarInfo.isRealWordConnect,
                pictureImageFile,
                descImageFile,
                soundFile,
                word.wordId,
                queryRunner,
                this.wordFileDb,
                this.commandBus,
              );
            } else {
              // 기존에 있는 단어일 경우 비슷하지만 다른말 정보만 저장
              const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
                wordId: word.wordId,
                similarWordId: similarWord.wordId,
              });
              await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);
            }
          }
        }

        await queryRunner.commitTransaction();
        return '등록이 완료 되었습니다.';
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('단어 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}

// 단어 저장 메서드
export const saveWord = async (
  wordLevelId,
  projectId,
  wordName,
  mean,
  exampleList,
  isRealWordConnect,
  pictureImageFile,
  descImageFile,
  soundFile,
  wordId,
  queryRunner,
  wordFileDb,
  commandBus,
) => {
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

  // 단어에 대한 파일 정보 저장
  if (pictureImageFile) {
    const command = new CreateFilesCommand(
      word.wordId,
      FileType.WORD,
      pictureImageFile,
      null,
      wordFileDb,
      queryRunner,
    );
    await commandBus.execute(command);
  }

  if (descImageFile) {
    const command = new CreateFilesCommand(
      word.wordId,
      FileType.WORD,
      descImageFile,
      null,
      wordFileDb,
      queryRunner,
    );
    await commandBus.execute(command);
  }

  if (soundFile) {
    const command = new CreateFilesCommand(
      word.wordId,
      FileType.WORD,
      soundFile,
      null,
      wordFileDb,
      queryRunner,
    );
    await commandBus.execute(command);
  }

  // 단어에 대한 예문 정보 저장
  for (const exampleInfo of exampleList) {
    const example = queryRunner.manager.getRepository(Example).create({
      wordId: word.wordId,
      sentence: exampleInfo.sentence,
      translation: exampleInfo.translation,
      source: exampleInfo.source,
      exampleSequence: exampleInfo.exampleSequence,
    });
    await queryRunner.manager.getRepository(Example).save(example);
  }

  if (wordId) {
    // 비슷하지만 다른말 정보 저장
    const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
      wordId,
      similarWordId: word.wordId,
    });
    await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);
  }

  return word;
};
