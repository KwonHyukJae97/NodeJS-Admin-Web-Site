import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 권한 수정에 필요한 Dto 정의
 */
export class UpdatePermissionDto {
  @IsNotEmpty()
  @IsString()
  readonly menuName: string;

  @IsNotEmpty()
  @IsString()
  readonly grantType: string;
}
