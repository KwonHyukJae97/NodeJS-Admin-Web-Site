import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  constructor(readonly user_id: number, readonly account_id: number, readonly grade: number) {}
}
