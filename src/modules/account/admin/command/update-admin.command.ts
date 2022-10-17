import { ICommand } from '@nestjs/cqrs';

export class UpdateAdminCommand implements ICommand {
  constructor(
    readonly password: string,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly roleId: number,
    readonly isSuper: boolean,
    readonly adminId: number,
  ) {}
}
