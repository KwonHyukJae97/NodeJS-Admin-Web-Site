import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAdminRoleCommand } from './update-adminRole.command';
import { AdminRole } from '../entities/adminrole.entity';
import { Repository } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 역할 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminRoleCommand)
export class UpdateAdminRoleHandler implements ICommandHandler<UpdateAdminRoleCommand> {
  constructor(
    @InjectRepository(AdminRole) private adminroleRepository: Repository<AdminRole>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: UpdateAdminRoleCommand) {
    const { roleName, roleId } = command;
    const adminrole = await this.adminroleRepository.findOneBy({ roleId: roleId });
    if (!adminrole) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '역할', 404);
    }

    adminrole.roleName = roleName;

    //역할 정보 DB저장
    try {
      await this.adminroleRepository.save(adminrole);
    } catch (err) {
      console.log(err);
      //저장 실패 에러메시지 반환
      return this.convertException.throwError('badInput', '역할정보에 ', 400);
    }

    //수정된 내용 반환
    return adminrole;
  }
}
