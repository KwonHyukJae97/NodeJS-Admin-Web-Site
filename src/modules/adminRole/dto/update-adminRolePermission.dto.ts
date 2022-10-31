import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { UpdateAdminRoleDto } from './update-adminRole.dto';

/**
 * 역할 수정 시 필요한 권한 데이터 dto
 */
export class UpdateAdminRolePermissionDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;
  @IsArray()
  readonly roleDto: UpdateAdminRoleDto[];
}
