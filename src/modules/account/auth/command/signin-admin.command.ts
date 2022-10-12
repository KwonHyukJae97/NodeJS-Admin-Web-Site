import { ICommand } from '@nestjs/cqrs';

export class SignInAdminCommand implements ICommand {
  constructor(readonly id: string, readonly password: string) {}
}
