import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToBoolean } from '../../../../common/decorator/boolean.decorator';

/**
 * 공지사항 수정에 필요한 요청 Dto 정의
 */
export class UpdateNoticeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @ToBoolean()
  isTop: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  noticeGrant: string;

  // 작성자 본인 확인을 위해 임시 사용
  // @IsNotEmpty()
  @IsString()
  role: string;
}
