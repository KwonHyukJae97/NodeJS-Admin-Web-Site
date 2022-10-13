import { IsString } from 'class-validator';

/**
 * 역할 수정 dto
 */
export class UpdateAdminRoleDto {
  @IsString()
  readonly roleName: string;
  readonly companyId: number;
}
