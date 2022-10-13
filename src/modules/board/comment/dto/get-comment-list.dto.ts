import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 답변 상세 조회 시, 필요한 필드로 구성한 응답 dto
 */

export class GetCommentListDto {
  @IsNotEmpty()
  @IsNumber()
  qnaId: number;

  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  viewCount: number;

  @IsNotEmpty()
  @IsDate()
  regDate: Date;

  @IsNotEmpty()
  @IsBoolean()
  isComment: boolean;
}
