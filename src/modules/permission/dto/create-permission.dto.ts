import { IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  readonly menuName: string;

  @IsString()
  readonly grantType: string;
}
