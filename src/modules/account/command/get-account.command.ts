import { ICommand } from '@nestjs/cqrs';

export class GetAccountCommand implements ICommand {
  constructor(readonly accountId: number, readonly loginDate: Date) {}
}
