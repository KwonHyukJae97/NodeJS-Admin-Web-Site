import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { rolePermissionDto } from './rolePermission.dto';

/**
 * 역할 등록 dto
 */
export class CreateAdminRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  @IsNotEmpty()
  @IsNumber()
  readonly companyId: number;

  @IsArray()
  readonly roleDto: rolePermissionDto[];
}
