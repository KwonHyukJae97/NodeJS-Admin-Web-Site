import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ToBoolean } from '../../../../common/decorator/boolean.decorator';

/**
 * 공지사항 등록에 필요한 요청 Dto 정의
 */
export class CreateNoticeDto {
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

  // 등록 권한 확인을 위해 임시 사용
  @IsNotEmpty()
  @IsString()
  role: string;
}
