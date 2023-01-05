import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExampleDto } from './example.dto';
import { ToBoolean } from '../../../common/decorator/boolean.decorator';

/**
 * 단어 수정 시 필요한 비슷하지만 다른말 Dto 정의
 */
export class UpdateSimilarInfoDto {
  @IsOptional()
  @IsNumber()
  similarWordId: number;

  @IsOptional()
  @IsNumber()
  similarInfoId: number;

  @IsOptional()
  @IsNumber()
  wordLevelId: number;

  @IsOptional()
  @IsNumber()
  projectId: number;

  @IsNotEmpty()
  @IsString()
  wordName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  mean: string;

  @IsNotEmpty()
  exampleList: ExampleDto[];

  @IsString()
  @IsOptional()
  pictureImageFileKey: string;

  @IsString()
  @IsOptional()
  descImageFileKey: string;

  @IsString()
  @IsOptional()
  soundFileKey: string;

  // 비슷하지만 다른말 삭제 여부
  @IsOptional()
  @ToBoolean()
  isDelete: boolean;

  // pictureImageFile: Express.Multer.File;
  // descImageFile: Express.Multer.File;
  // soundFile: Express.Multer.File;
}
