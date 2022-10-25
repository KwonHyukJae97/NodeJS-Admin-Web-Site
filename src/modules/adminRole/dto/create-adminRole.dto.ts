import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 역할 등록 dto
 */
export class CreateAdminRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  readonly companyId: number;
  readonly permissionId: number;
}
