/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { GetAllUserQuery } from './get-all-user.query';

/**
 * 앱 사용자 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllUserQuery)
export class GetAllUserQueryHandler implements IQueryHandler<GetAllUserQuery> {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async execute(query: GetAllUserQuery) {
    const user = await this.usersRepository.find({});

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    // 앱 사용자 전체 리스트
    return user;
  }
}
