import { IsString } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  readonly menuName: string;

  @IsString()
  readonly grantType: string;
}
