import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdatePermissionCommand } from './command/update-permission.command';
import { DeletePermissionCommand } from './command/delete-permission.command';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionInfoQuery } from './query/get-permission-info.query';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreatePermissionCommand } from './command/create-permission.command';
import { GetAllPermissionQuery } from './query/get-all-permission.query';
/**
 * 권한 API controller
 */
@Controller('permission')
export class PermissionController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 권한 등록
   */
  @Post()
  async createPermission(@Body() dto: CreatePermissionDto): Promise<void> {
    const { menuName, grantType } = dto;
    const command = new CreatePermissionCommand(menuName, grantType);
    return this.commandBus.execute(command);
  }

  /**
   * 권한 전체 리스트 조회
   */
  @Get()
  getAllPermission() {
    const getAllPermissionQuery = new GetAllPermissionQuery();
    return this.queryBus.execute(getAllPermissionQuery);
  }

  /**
   * 권한 상세 정보 조회
   * @Param : permission_id
   */
  @Get(':id')
  getPermissionInfo(@Param('id') permissionId: number) {
    const getPermissionInfoQuery = new GetPermissionInfoQuery(permissionId);
    return this.queryBus.execute(getPermissionInfoQuery);
  }

  /**
   * 권한 상세 정보 수정
   * @Param : permission_id
   */
  @Patch(':id')
  updatePermission(@Param('id') permissionId: number, @Body() dto: UpdatePermissionDto) {
    const { menuName, grantType } = dto;
    const command = new UpdatePermissionCommand(menuName, grantType, permissionId);
    return this.commandBus.execute(command);
  }

  /**
   * 권한 정보 삭제
   * @param : permission_id
   */
  @Delete(':id')
  deletePermission(@Param('id') permissionId: number) {
    const command = new DeletePermissionCommand(permissionId);
    return this.commandBus.execute(command);
  }
}
