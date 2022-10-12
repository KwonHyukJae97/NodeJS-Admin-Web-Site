/**
 * 역할 등록 dto
 */
export class CreateAdminRoleDto {
  readonly roleName: string;
  readonly companyId: number;
  readonly permissionId: number;
}
