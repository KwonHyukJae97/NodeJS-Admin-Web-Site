import { ICommand } from '@nestjs/cqrs';

export class DeleteAdminCommand implements ICommand {
  constructor(readonly accountId: number, readonly delDate: Date) {}
}
