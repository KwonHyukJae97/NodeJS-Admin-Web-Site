import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { GetFindIdQuery } from './get-findId.query';

@QueryHandler(GetFindIdQuery)
export class GetFindIdQueryHandler implements IQueryHandler<GetFindIdQuery> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetFindIdQuery) {
    const { param } = query;

    const { name, phone } = param;

    const id = await this.accountRepository.findOne({ where: { name, phone } });

    if (!id) {
      return this.convertException.badRequestAccountError('입력한', 400);
    }
    const returnId = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.id')
      .where('account.name = :name', { name })
      .where('account.phone = :phone', { phone })
      .getOne();

    return returnId;
  }
}
