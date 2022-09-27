import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  constructor(readonly account_id: number, readonly grade: number) {}
}
