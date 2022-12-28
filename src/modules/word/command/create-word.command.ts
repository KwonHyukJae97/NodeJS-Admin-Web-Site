import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../account/entities/account';
import { SimilarInfoDto } from '../dto/similar-info.dto';
import { ExampleDto } from '../dto/example.dto';

/**
 * 단어 등록용 커맨드 정의
 */
export class CreateWordCommand implements ICommand {
  constructor(
    readonly wordLevelId: number | null,
    readonly projectId: number | null,
    readonly wordName: string,
    readonly mean: string,
    readonly exampleList: ExampleDto[],
    readonly similarInfoList: SimilarInfoDto[],
    readonly isRealWordConnect: boolean,
    readonly account: Account,
    readonly files: Express.MulterS3.File[],
  ) {}
}
