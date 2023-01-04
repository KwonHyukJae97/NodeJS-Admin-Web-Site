import { ICommand } from '@nestjs/cqrs';
import { UpdateExampleDto } from '../dto/update-example.dto';

/**
 * 단어 수정용 커맨드 정의
 */
export class UpdateWordCommand implements ICommand {
  constructor(
    readonly wordLevelId: number | null,
    readonly projectId: number | null,
    readonly wordName: string,
    readonly mean: string,
    readonly exampleList: UpdateExampleDto[],
    readonly wordId: number | null,
    readonly isRealWordConnect: boolean | null,
    readonly isMainWord: boolean,
    readonly isAutoMain: boolean,
    readonly pictureImageFile: Express.MulterS3.File | null,
    readonly descImageFile: Express.MulterS3.File | null,
    readonly soundFile: Express.MulterS3.File | null,
  ) {}
}
