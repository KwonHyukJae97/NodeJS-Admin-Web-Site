import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Example } from '../entities/example';
import { Word } from '../entities/word';
import { SimilarWord } from '../entities/similar-word';
import { ConvertException } from '../../../common/utils/convert-exception';
import { WordFileDb } from '../word-file-db';
import { UpdateWordCommand } from './update-word.command';
import { UpdateFilesCommand } from '../../file/command/update-files.command';
import { FileType } from '../../file/entities/file-type.enum';
import { WordFile } from '../../file/entities/word-file';
import { saveWord } from './create-word.handler';
import { DeleteFilesCommand } from '../../file/command/delete-files.command';

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
    @InjectRepository(WordFile) private fileRepository: Repository<WordFile>,
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
    const { updateWordDto, files } = command;

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

      // 단어 수정 함수
      const editWord = async (
        wordId,
        wordLevelId,
        projectId,
        wordName,
        mean,
        exampleList,
        isRealWordConnect,
        isMainWord,
        isAutoMain,
        pictureImageFile,
        descImageFile,
        soundFile,
      ) => {
        // 단어 정보 조회
        const word = await this.wordRepository.findOneBy({
          wordId: wordId,
        });

        if (!word) {
          return this.convertException.notFoundError('단어', 404);
        }

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
        for (const exampleInfo of exampleList) {
          if (!exampleInfo.exampleId) {
            // example dto에 exampleId가 없으면 신규 등록
            const newExample = queryRunner.manager.getRepository(Example).create({
              wordId: word.wordId,
              sentence: exampleInfo.sentence,
              translation: exampleInfo.translation,
              source: exampleInfo.source,
              exampleSequence: exampleInfo.exampleSequence,
            });

            await queryRunner.manager.getRepository(Example).save(newExample);
          } else if (exampleInfo.exampleId && !exampleInfo.isDelete) {
            // example dto에 exampleId가 있고, isDelete가 false라면 수정
            const editExample = await this.exampleRepository.findOneBy({
              exampleId: exampleInfo.exampleId,
            });
            editExample.sentence = exampleInfo.sentence;
            editExample.translation = exampleInfo.translation;
            editExample.source = exampleInfo.source;
            editExample.exampleSequence = exampleInfo.exampleSequence;

            await queryRunner.manager.getRepository(Example).save(editExample);
          } else if (exampleInfo.isDelete) {
            // example dto에 isDelete가 true라면 삭제
            await queryRunner.manager
              .getRepository(Example)
              .delete({ exampleId: exampleInfo.exampleId });
          }
        }
      };

      for (let i = 0; i < updateWordDto['updateWordDto'].length; i++) {
        const pictureImageFile = findKeyFile(updateWordDto['updateWordDto'][i].pictureImageFileKey);
        const descImageFile = findKeyFile(updateWordDto['updateWordDto'][i].descImageFileKey);
        const soundFile = findKeyFile(updateWordDto['updateWordDto'][i].soundFileKey);

        // word dto에 isDelete가 false라면 수정 로직 실행
        if (!updateWordDto['updateWordDto'][i].isDelete) {
          await editWord(
            updateWordDto['updateWordDto'][i].wordId,
            updateWordDto['updateWordDto'][i].wordLevelId,
            updateWordDto['updateWordDto'][i].projectId,
            updateWordDto['updateWordDto'][i].wordName,
            updateWordDto['updateWordDto'][i].mean,
            updateWordDto['updateWordDto'][i].exampleList,
            updateWordDto['updateWordDto'][i].isRealWordConnect,
            updateWordDto['updateWordDto'][i].isMainWord,
            updateWordDto['updateWordDto'][i].isAutoMain,
            pictureImageFile,
            descImageFile,
            soundFile,
          );

          // // 단어 정보 조회
          // const word = await this.wordRepository.findOneBy({
          //   wordId: updateWordDto['updateWordDto'][i].wordId,
          // });
          //
          // if (!word) {
          //   return this.convertException.notFoundError('단어', 404);
          // }
          //
          // word.wordLevelId = updateWordDto['updateWordDto'][i].wordLevelId;
          // word.projectId = updateWordDto['updateWordDto'][i].projectId;
          // word.wordName = updateWordDto['updateWordDto'][i].wordName;
          // word.mean = updateWordDto['updateWordDto'][i].mean;
          // word.wordStatus = updateWordDto['updateWordDto'][i].isRealWordConnect ? '2' : '1';
          // word.isMainWord = updateWordDto['updateWordDto'][i].isMainWord;
          // word.isAutoMain = updateWordDto['updateWordDto'][i].isAutoMain;
          //
          // await queryRunner.manager.getRepository(Word).save(word);
          //
          // // 단어에 대한 파일 정보 수정
          // if (pictureImageFile) {
          //   const command = new UpdateFilesCommand(
          //     word.wordId,
          //     FileType.WORD,
          //     pictureImageFile,
          //     null,
          //     this.wordFileDb,
          //     queryRunner,
          //   );
          //   await this.commandBus.execute(command);
          // }
          //
          // if (descImageFile) {
          //   const command = new UpdateFilesCommand(
          //     word.wordId,
          //     FileType.WORD,
          //     descImageFile,
          //     null,
          //     this.wordFileDb,
          //     queryRunner,
          //   );
          //   await this.commandBus.execute(command);
          // }
          //
          // if (soundFile) {
          //   const command = new UpdateFilesCommand(
          //     word.wordId,
          //     FileType.WORD,
          //     soundFile,
          //     null,
          //     this.wordFileDb,
          //     queryRunner,
          //   );
          //   await this.commandBus.execute(command);
          // }
          //
          // // 단어에 대한 예문 정보 수정
          // for (const exampleInfo of updateWordDto['updateWordDto'][i].exampleList) {
          //   if (!exampleInfo.exampleId) {
          //     // example dto에 exampleId가 없으면 신규 등록
          //     const newExample = queryRunner.manager.getRepository(Example).create({
          //       wordId: word.wordId,
          //       sentence: exampleInfo.sentence,
          //       translation: exampleInfo.translation,
          //       source: exampleInfo.source,
          //       exampleSequence: exampleInfo.exampleSequence,
          //     });
          //
          //     await queryRunner.manager.getRepository(Example).save(newExample);
          //   } else if (exampleInfo.exampleId && !exampleInfo.isDelete) {
          //     // example dto에 exampleId가 있고, isDelete가 false라면 수정
          //     const editExample = await this.exampleRepository.findOneBy({
          //       exampleId: exampleInfo.exampleId,
          //     });
          //     editExample.sentence = exampleInfo.sentence;
          //     editExample.translation = exampleInfo.translation;
          //     editExample.source = exampleInfo.source;
          //     editExample.exampleSequence = exampleInfo.exampleSequence;
          //
          //     await queryRunner.manager.getRepository(Example).save(editExample);
          //
          //     // for (const example of examples) {
          //     //   if (example.exampleId == exampleInfo.exampleId) {
          //     //     const editExample = await this.exampleRepository.findOneBy({
          //     //       exampleId: exampleInfo.exampleId,
          //     //     });
          //     //     editExample.sentence = exampleInfo.sentence;
          //     //     editExample.translation = exampleInfo.translation;
          //     //     editExample.source = exampleInfo.source;
          //     //     editExample.exampleSequence = exampleInfo.exampleSequence;
          //     //
          //     //     await queryRunner.manager.getRepository(Example).save(editExample);
          //     //   }
          //     // }
          //   } else if (exampleInfo.isDelete) {
          //     // example dto에 isDelete가 true라면 삭제
          //     await queryRunner.manager
          //       .getRepository(Example)
          //       .delete({ exampleId: exampleInfo.exampleId });
          //   }

          if (updateWordDto['updateWordDto'][i].similarInfoList) {
            for (const similarInfo of updateWordDto['updateWordDto'][i].similarInfoList) {
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

              const pictureImageFile = findKeyFile(similarInfo.pictureImageFileKey);
              const descImageFile = findKeyFile(similarInfo.descImageFileKey);
              const soundFile = findKeyFile(similarInfo.soundFileKey);

              if (!similarWord && !similarInfo.similarWordId) {
                // 기존 db에도 데이터가 없고 similar dto에 similarWordId가 없으면 신규 등록
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
                  updateWordDto['updateWordDto'][i].wordId,
                  queryRunner,
                  this.wordFileDb,
                  this.commandBus,
                );
              } else if (similarInfo.similarWordId && !similarInfo.isDelete) {
                // similar dto에 similarWordId가 있고 isDelete가 false라면 수정
                await editWord(
                  similarInfo.similarWordId,
                  similarInfo.wordLevelId,
                  similarInfo.projectId,
                  similarInfo.wordName,
                  similarInfo.mean,
                  similarInfo.exampleList,
                  similarInfo.isRealWordConnect,
                  similarInfo.isMainWord,
                  similarInfo.isAutoMain,
                  pictureImageFile,
                  descImageFile,
                  soundFile,
                );
              } else if (similarInfo.isDelete) {
                // similar dto에 isDelete가 true라면 삭제
                const wordFiles = await this.fileRepository.findBy({
                  wordId: similarInfo.similarWordId,
                });
                if (wordFiles.length !== 0) {
                  const command = new DeleteFilesCommand(
                    similarInfo.similarWordId,
                    this.wordFileDb,
                    queryRunner,
                  );
                  await this.commandBus.execute(command);
                }
                await queryRunner.manager
                  .getRepository(Word)
                  .softDelete({ wordId: similarInfo.similarWordId });
              } else {
                // 기존 db에 데이터가 있고 similar dto에 similarWordId가 없다면 비슷하지만 다른말 정보만 저장
                const similarWordInfo = queryRunner.manager.getRepository(SimilarWord).create({
                  wordId: updateWordDto['updateWordDto'][i].wordId,
                  similarWordId: similarWord.wordId,
                });
                await queryRunner.manager.getRepository(SimilarWord).save(similarWordInfo);
              }
            }
          }
        }

        // word dto에 isDelete가 true라면 삭제 로직 실행
        else {
          const wordFiles = await this.fileRepository.findBy({
            wordId: updateWordDto['updateWordDto'][i].wordId,
          });
          if (wordFiles.length !== 0) {
            const command = new DeleteFilesCommand(
              updateWordDto['updateWordDto'][i].wordId,
              this.wordFileDb,
              queryRunner,
            );
            await this.commandBus.execute(command);
          }
          await queryRunner.manager
            .getRepository(Word)
            .softDelete({ wordId: updateWordDto['updateWordDto'][i].wordId });
        }
      }

      await queryRunner.commitTransaction();
      return '수정이 완료 되었습니다.';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('단어 정보에', 400);
    } finally {
      await queryRunner.release();
    }

    // // 단어 정보 조회
    // const word = await this.wordRepository.findOneBy({ wordId });
    //
    // if (!word) {
    //   return this.convertException.notFoundError('단어', 404);
    // }
    //
    // // 단어 예문 정보 조회
    // const examples = await this.exampleRepository.findBy({ wordId });
    //
    // try {
    //   // 본단어에 연결되어있다면 연결단어 정보 저장
    //   // if (isRealWordConnect) {
    //   //   word.connectWordId =
    //   // }
    //   word.wordLevelId = wordLevelId;
    //   word.projectId = projectId;
    //   word.wordName = wordName;
    //   word.mean = mean;
    //   word.wordStatus = isRealWordConnect ? '2' : '1';
    //   word.isMainWord = isMainWord;
    //   word.isAutoMain = isAutoMain;
    //
    //   await queryRunner.manager.getRepository(Word).save(word);
    //
    //   // 단어에 대한 파일 정보 수정
    //   if (pictureImageFile) {
    //     const command = new UpdateFilesCommand(
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
    //     const command = new UpdateFilesCommand(
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
    //     const command = new UpdateFilesCommand(
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
    //   // 단어에 대한 예문 정보 수정
    //   // example dto에 exampleId가 없으면 신규 등록
    //   // example dto에 exampleId가 있다면 수정
    //   // example db의 데이터 중 example dto의 exampleId가 일치하는게 없다면 삭제
    //   let result;
    //   for (const exampleInfo of exampleList) {
    //     if (!exampleInfo.exampleId) {
    //       // 신규 등록
    //       const newExample = queryRunner.manager.getRepository(Example).create({
    //         wordId: word.wordId,
    //         sentence: exampleInfo.sentence,
    //         translation: exampleInfo.translation,
    //         source: exampleInfo.source,
    //         exampleSequence: exampleInfo.exampleSequence,
    //       });
    //
    //       await queryRunner.manager.getRepository(Example).save(newExample);
    //     } else if (exampleInfo.exampleId) {
    //       // 수정
    //       for (const example of examples) {
    //         if (example.exampleId == exampleInfo.exampleId) {
    //           const editExample = await this.exampleRepository.findOneBy({
    //             exampleId: exampleInfo.exampleId,
    //           });
    //           editExample.sentence = exampleInfo.sentence;
    //           editExample.translation = exampleInfo.translation;
    //           editExample.source = exampleInfo.source;
    //           editExample.exampleSequence = exampleInfo.exampleSequence;
    //
    //           await queryRunner.manager.getRepository(Example).save(editExample);
    //         }
    //       }
    //     } else {
    //       // 일치하지 않은 exampleId 추출
    //       examples.map((ex) => {
    //         return (result = ex.exampleId !== exampleInfo.exampleId);
    //       });
    //
    //       // 삭제
    //       for (const example of result) {
    //         await queryRunner.manager
    //           .getRepository(Example)
    //           .delete({ exampleId: example.exampleId });
    //       }
    //       console.log('result', result);
    //     }
    //   }
    //
    //   // for (const exampleInfo of exampleList) {
    //   //   const example = queryRunner.manager.getRepository(Example).create({
    //   //     wordId: word.wordId,
    //   //     sentence: exampleInfo.sentence,
    //   //     translation: exampleInfo.translation,
    //   //     source: exampleInfo.source,
    //   //     exampleSequence: exampleInfo.exampleSequence,
    //   //   });
    //   //   await queryRunner.manager.getRepository(Example).save(example);
    //   // }
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
    //   await queryRunner.commitTransaction();
    //   return word;
    // } catch (err) {
    //   await queryRunner.rollbackTransaction();
    //   return this.convertException.badInput('단어 정보에', 400);
    // } finally {
    //   await queryRunner.release();
    // }
  }
}
