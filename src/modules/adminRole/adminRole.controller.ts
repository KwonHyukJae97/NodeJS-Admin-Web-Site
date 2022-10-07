import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateAdminRoleCommand } from './command/update-adminRole.command';
import { DeleteAdminRoleCommand } from './command/delete-adminRole.command';
import { UpdateAdminRoleDto } from './dto/update-adminRole.dto';
import { GetAdminRoleInfoQuery } from './query/get-adminRole-info.query';
import { CreateAdminRoleDto } from './dto/create-adminRole.dto';
import { CreateAdminRoleCommand } from './command/create-adminRole.command';
import { GetAllAdminRoleQuery } from './query/get-all-adminRole.query';
/**
 * 역할 API controller
 */
@Controller('adminrole')
export class AdminRoleController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 역할 등록
   */
  @Post()
  async createAdminRole(@Body() dto: CreateAdminRoleDto): Promise<void> {
    const { roleName, companyId, permissionId } = dto;
    const command = new CreateAdminRoleCommand(roleName, companyId, permissionId);
    return this.commandBus.execute(command);
  }

  /**
   * 역할 전체 리스트 조회
   */
  @Get()
  getAllAdminRole() {
    const getAllAdminRoleQuery = new GetAllAdminRoleQuery();
    return this.queryBus.execute(getAllAdminRoleQuery);
  }

  /**
   * 역할 상세 정보 조회
   * @Param : role_id
   */
  @Get(':id')
  getAdminRoleInfo(@Param('id') roleId: number) {
    const getAdminRoleInfoQuery = new GetAdminRoleInfoQuery(roleId);
    return this.queryBus.execute(getAdminRoleInfoQuery);
  }

  /**
   * 역할 상세 정보 수정
   * @Param : role_id
   */
  @Patch(':id')
  updateAdminRole(@Param('id') roleId: number, @Body() dto: UpdateAdminRoleDto) {
    const { roleName } = dto;
    const command = new UpdateAdminRoleCommand(roleName, roleId);
    return this.commandBus.execute(command);
  }

  /**
   * 역할 정보 삭제
   * @param : role_id
   */
  @Delete(':id')
  deleteAdminRole(@Param('id') roleId: number) {
    const command = new DeleteAdminRoleCommand(roleId);
    return this.commandBus.execute(command);
  }
}
