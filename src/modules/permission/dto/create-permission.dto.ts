import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 권한 등록에 필요한 Dto 정의
 */
export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  readonly menuName: string;

  @IsNotEmpty()
  @IsString()
  readonly grantType: string;
}
