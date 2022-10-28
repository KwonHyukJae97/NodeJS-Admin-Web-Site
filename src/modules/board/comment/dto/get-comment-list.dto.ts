import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 답변 전체 리스트 조회에 필요한 응답 Dto 정의
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
