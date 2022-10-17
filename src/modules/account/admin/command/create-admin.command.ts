import { ICommand } from '@nestjs/cqrs';

export class CreateAdminCommand implements ICommand {
  constructor(
    readonly id: string,
    readonly password: string,
    readonly name: string,
    readonly email: string,
    readonly phone: string,
    readonly nickname: string,
    readonly birth: string,
    readonly gender: string,
    readonly companyId: number,
    readonly roleId: number,
    readonly isSuper: boolean,
    readonly division: boolean,
  ) {}
}
