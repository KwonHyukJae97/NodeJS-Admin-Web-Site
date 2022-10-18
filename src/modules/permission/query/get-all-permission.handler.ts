/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { GetAllPermissionQuery } from './get-all-permission.query';

/**
 * 권한 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllPermissionQuery)
export class GetAllPermissionQueryHandler implements IQueryHandler<GetAllPermissionQuery> {
  constructor(
    @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetAllPermissionQuery) {
    const permission = await this.permissionsRepository.find({});

    if (!permission) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '권한', 404);
    }
    // 권한 전체 리스트 반환
    return permission;
  }
}
