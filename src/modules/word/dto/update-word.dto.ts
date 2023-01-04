import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { SimilarInfoDto } from './similar-info.dto';
import { UpdateExampleDto } from './update-example.dto';

/**
 * 단어 수정에 필요한 요청 Dto 정의
 */
export class UpdateWordDto {
  @IsNotEmpty()
  @IsNumber()
  wordId: number;

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
  exampleList: UpdateExampleDto[];

  @IsOptional()
  similarInfoList: SimilarInfoDto[];

  // 본단어 연결 여부
  @IsNotEmpty()
  @IsBoolean()
  isRealWordConnect: boolean;

  @IsOptional()
  @IsBoolean()
  isMainWord: boolean;

  @IsOptional()
  @IsBoolean()
  isAutoMain: boolean;

  @IsString()
  @IsOptional()
  pictureImageFileKey: string;

  @IsString()
  @IsOptional()
  descImageFileKey: string;

  @IsString()
  @IsOptional()
  soundFileKey: string;

  // pictureImageFile: Express.Multer.File;
  // descImageFile: Express.Multer.File;
  // soundFile: Express.Multer.File;
}
