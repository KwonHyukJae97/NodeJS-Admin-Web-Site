import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temporary } from '../entities/temporary';
import { GetTemporaryQuery } from './get-temporary.query';

@QueryHandler(GetTemporaryQuery)
export class GetTemporaryHandler implements IQueryHandler<GetTemporaryQuery> {
  constructor(
    @InjectRepository(Temporary)
    private temporaryRepository: Repository<Temporary>,
  ) {}

  async execute(query: GetTemporaryQuery) {
    const temporary = await this.temporaryRepository.find({
      order: { temporaryId: 'DESC' },
    });

    if (!temporary) {
      throw new NotFoundException('임시 휴면 계정 데이터가 없습니다.');
    }

    return temporary;
  }
}
