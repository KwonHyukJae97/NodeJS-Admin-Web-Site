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
@Controller('role')
export class AdminRoleController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 역할 등록 메소드
   * @param createAdminRoleDto : 역할 등록에 필요한 dto
   * @return : 역할 등록 커맨드 전송
   */
  @Post()
  async createAdminRole(@Body() createAdminRoleDto: CreateAdminRoleDto): Promise<void> {
    const { roleName, grantType, companyId, permissionId } = createAdminRoleDto;
    const command = new CreateAdminRoleCommand(roleName, grantType, companyId, permissionId);
    return this.commandBus.execute(command);
  }

  /**
   * 역할 전체 리스트 조회
   * @return : 역할 리스트 조회 쿼리 전송
   */
  @Get()
  getAllAdminRole() {
    const getAllAdminRoleQuery = new GetAllAdminRoleQuery();
    return this.queryBus.execute(getAllAdminRoleQuery);
  }

  /**
   * 역할 상세 정보 조회
   * @Param : role_id
   * @return : 역할 상세 정보 조회 쿼리 전송
   */
  @Get(':id')
  getAdminRoleInfo(@Param('id') roleId: number) {
    const getAdminRoleInfoQuery = new GetAdminRoleInfoQuery(roleId);
    return this.queryBus.execute(getAdminRoleInfoQuery);
  }

  /**
   * 역할 상세 정보 수정
   * @Param : role_id
   * @return : 역할 정보 수정 커맨드 전송
   */
  @Patch(':id')
  updateAdminRole(@Param('id') roleId: number, @Body() updateAdminDto: UpdateAdminRoleDto) {
    const { roleName, grantType, permissionId } = updateAdminDto;
    const command = new UpdateAdminRoleCommand(roleName, grantType, permissionId, roleId);
    return this.commandBus.execute(command);
  }

  /**
   * 역할 정보 삭제
   * @Param : role_id
   * @return : 역할 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  deleteAdminRole(@Param('id') roleId: number) {
    const command = new DeleteAdminRoleCommand(roleId);
    return this.commandBus.execute(command);
  }
}
