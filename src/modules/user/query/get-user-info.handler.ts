import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetUserInfoQuery } from './get-user-info.query';

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async execute(query: GetUserInfoQuery) {
    const { account_id } = query;

    const user = await this.usersRepository.findOne({
      where: {
        account_id,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return {
      id: user.account_id,
      state: user.grade,
    };
  }
}
