import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { rolePermissionDto } from './rolePermission.dto';

/**
 * 역할 수정 시 필요한 권한 데이터 dto
 */
export class UpdateAdminRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  @IsNotEmpty()
  @IsString()
  readonly updateBy: string;

  @IsArray()
  readonly roleDto: rolePermissionDto[];
}
