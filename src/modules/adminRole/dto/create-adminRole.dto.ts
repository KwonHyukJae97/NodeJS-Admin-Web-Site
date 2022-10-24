import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 역할 등록 dto
 */
export class CreateAdminRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  @IsNotEmpty()
  @IsString()
  readonly grantType: string;

  @IsNotEmpty()
  @IsNumber()
  readonly companyId: number;

  @IsNotEmpty()
  @IsNumber()
  readonly permissionId: number;
}
