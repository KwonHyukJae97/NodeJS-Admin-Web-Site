import { ICommand } from '@nestjs/cqrs';

export class SignInUserCommand implements ICommand {
  constructor(readonly id: string, readonly password: string) {}
}
