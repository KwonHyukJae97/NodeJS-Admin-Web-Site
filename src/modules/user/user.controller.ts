import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './command/create-user.command';
import { UpdateUserCommand } from './command/update-user.command';
import { DeleteUserCommand } from './command/delete-user.command';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserInfoQuery } from './query/get-user-info.query';
import { GetAllUserQuery } from './query/get-all-user.query';
import { FileInterceptor } from '@nestjs/platform-express';

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

  /**
   * 앱사용자 상세 정보 수정
   * @Param : account_id
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateUser(
    @Param('id') accountId: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const { password, email, phone, nickname, grade } = dto;
    const command = new UpdateUserCommand(password, email, phone, nickname, grade, accountId, file);

    return this.commandBus.execute(command);
  }

  /**
   * 앱 사용자 정보 삭제
   * @ param : user_id
   */
  @Delete(':id')
  deleteUser(@Param('id') accountId: number, delDate: Date) {
    const command = new DeleteUserCommand(accountId, delDate);
    return this.commandBus.execute(command);
  }
}
