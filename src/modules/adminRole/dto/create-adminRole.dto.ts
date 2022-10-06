import { IsString } from 'class-validator';

/**
 * 역할 등록 dto
 */
export class CreateAdminRoleDto {
  @IsString()
  readonly roleName: string;
  readonly companyId: number;
}
