import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExampleDto } from './example.dto';
import { SimilarInfoDto } from './similar-info.dto';

/**
 * 단어 등록에 필요한 요청 Dto 정의
 */
export class CreateWordDto {
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

  @IsOptional()
  similarInfoList: SimilarInfoDto[];

  // 본단어 연결 여부
  @IsNotEmpty()
  @IsBoolean()
  isRealWordConnect: boolean;
}
