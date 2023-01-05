import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { UpdateExampleDto } from './update-example.dto';
import { UpdateSimilarInfoDto } from './update-similar-info.dto';
import { ToBoolean } from '../../../common/decorator/boolean.decorator';

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

  @IsOptional()
  @IsString()
  wordName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mean: string;

  @IsOptional()
  exampleList: UpdateExampleDto[];

  @IsOptional()
  similarInfoList: UpdateSimilarInfoDto[];

  // 본단어 연결 여부
  @IsOptional()
  @IsBoolean()
  isRealWordConnect: boolean;

  @IsOptional()
  @IsBoolean()
  isMainWord: boolean;

  @IsOptional()
  @IsBoolean()
  isAutoMain: boolean;

  @IsOptional()
  @IsString()
  pictureImageFileKey: string;

  @IsOptional()
  @IsString()
  descImageFileKey: string;

  @IsOptional()
  @IsString()
  soundFileKey: string;

  // 단어 삭제 여부
  @IsOptional()
  @ToBoolean()
  isDelete: boolean;

  // pictureImageFile: Express.Multer.File;
  // descImageFile: Express.Multer.File;
  // soundFile: Express.Multer.File;
}
