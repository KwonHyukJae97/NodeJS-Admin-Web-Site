import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRoleController } from './adminRole.controller';
import { AdminRole } from './entities/adminRole.entity';
import { GetAdminRoleInfoQueryHandler } from './query/get-adminRole-info.handler';
import { DeleteAdminRoleHandler } from './command/deleate-adminRole.handler';
import { UpdateAdminRoleHandler } from './command/update-adminRole.handler';
import { CreateAdminRoleHandler } from './command/create-adminRole.handler';
import { Company } from '../company/entities/company.entity';
import { GetAllAdminRoleQueryHandler } from './query/get-all-adminRole.handler';
import { RolePermission } from './entities/rolePermission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Admin } from '../account/admin/entities/admin.entity';

const CommandHandlers = [CreateAdminRoleHandler, UpdateAdminRoleHandler, DeleteAdminRoleHandler];
const QueryHandlers = [GetAdminRoleInfoQueryHandler, GetAllAdminRoleQueryHandler];
@Module({
  imports: [
    TypeOrmModule.forFeature([AdminRole, Company, RolePermission, Permission, Admin]),
    CqrsModule,
  ],
  controllers: [AdminRoleController],
  providers: [...CommandHandlers, ...QueryHandlers, ConvertException],
})
export class AdminRoleModule {}
