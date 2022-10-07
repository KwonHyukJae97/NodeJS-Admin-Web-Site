import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionController } from './permission.controller';
import { Permission } from './entities/permission.entity';
import { GetPermissionInfoQueryHandler } from './query/get-permission-info.handler';
import { DeletePermissionHandler } from './command/deleate-permission.handler';
import { UpdatePermissionHandler } from './command/update-permission.handler';
import { CreatePermissionHandler } from './command/create-permission.handler';

const CommandHandlers = [CreatePermissionHandler, UpdatePermissionHandler, DeletePermissionHandler];
const QueryHandlers = [GetPermissionInfoQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([Permission]), CqrsModule],
  controllers: [PermissionController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class PermissionModule {}
