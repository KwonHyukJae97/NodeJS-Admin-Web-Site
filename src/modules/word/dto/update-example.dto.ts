import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ToBoolean } from '../../../common/decorator/boolean.decorator';

/**
 * 단어 수정 시 필요한 예문 Dto 정의
 */
export class UpdateExampleDto {
  @IsNotEmpty()
  @IsNumber()
  exampleId: number;

  @IsNotEmpty()
  @IsString()
  sentence: string;

  @IsNotEmpty()
  @IsString()
  translation: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  source: string;

  @IsNotEmpty()
  @IsNumber()
  exampleSequence: number;

  // 얘문 삭제 여부
  @IsOptional()
  @ToBoolean()
  isDelete: boolean;
}
