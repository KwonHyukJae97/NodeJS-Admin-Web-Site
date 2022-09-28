import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './command/create-user.command';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserInfoQuery } from './query/get-user-info.query';
import { GetAllUserQuery } from './query/get-all-user.query';

/**
 * 앱사용자 API controller
 */
@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 앱사용자 등록
   */
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    const { userId, accountId, grade } = dto;

    const command = new CreateUserCommand(userId, accountId, grade);

    return this.commandBus.execute(command);
  }

  /**
   * 앱사용자 전체 리스트 조회
   */
  @Get()
  getAllUser() {
    const getAllUserQuery = new GetAllUserQuery();
    return this.queryBus.execute(getAllUserQuery);
  }

  /**
   * 앱사용자 상세 정보 조회
   * @Param : account_id
   */
  @Get(':id')
  getUserInfo(@Param('id') accountId: number) {
    const getUserInfoQuery = new GetUserInfoQuery(accountId);
    return this.queryBus.execute(getUserInfoQuery);
  }
}
