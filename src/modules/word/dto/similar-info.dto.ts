import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExampleDto } from './example.dto';

/**
 * 단어 등록 시 필요한 비슷하지만 다른말 Dto 정의
 */
export class SimilarInfoDto {
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

  pictureImageFile: Express.Multer.File;
  descImageFile: Express.Multer.File;
  soundFile: Express.Multer.File;
}
