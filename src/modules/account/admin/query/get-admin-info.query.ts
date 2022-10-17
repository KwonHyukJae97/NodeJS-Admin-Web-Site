import { IQuery } from '@nestjs/cqrs';

export class GetAdminInfoQuery implements IQuery {
  constructor(readonly adminId: number) {}
}
