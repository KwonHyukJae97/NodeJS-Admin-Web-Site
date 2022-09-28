import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetUserListQuery } from './get-user-list.query';

@QueryHandler(GetUserListQuery)
export class GetUserListHandler implements IQueryHandler<GetUserListQuery> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserListQuery) {
    const user = await this.userRepository.find({
      order: { userId: 'DESC' },
    });

    if (!user) {
      throw new NotFoundException('없음~');
    }
    return user;
  }
}
