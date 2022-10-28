import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 역할 수정 dto
 */
export class UpdateAdminRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  @IsNotEmpty()
  @IsString()
  readonly companyId: number;
}
