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
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpUserCommand } from '../auth/command/signup-user.command';
import { SignUpUserDto } from '../auth/dto/signup-user.dto';
import { DeleteUserCommand } from './command/delete-user.command';
import { UpdateUserCommand } from './command/update-user.command';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUserQuery } from './query/get-all-user.query';
import { GetUserInfoQuery } from './query/get-user-info.query';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * 앱사용자 정보 조회, 수정, 삭제 처리 API Controller
 */
@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 앱 사용자 전체 리스트 조회
   * @return : 앱 사용자 리스트 조회 커맨드 전송
   */
  @Get()
  getAllUser() {
    const getAllUserQuery = new GetAllUserQuery();
    return this.queryBus.execute(getAllUserQuery);
  }

  /**
   * 앱사용자 상세 정보 조회
   * @Param : user_id
   * @return : 앱사용자 상세 정보 조회 쿼리 전송
   */
  @Get(':id')
  getUserInfo(@Param('id') userId: number) {
    const getUserInfoQuery = new GetUserInfoQuery(userId);
    return this.queryBus.execute(getUserInfoQuery);
  }

  /**
   * 앱사용자 상세 정보 수정
   * @Param : user_id
   * @return : 앱 사용자 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateUser(
    @Param('id') userId: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const { password, email, phone, nickname, grade } = dto;
    const command = new UpdateUserCommand(password, email, phone, nickname, grade, userId, file);

    return this.commandBus.execute(command);
  }

  /**
   * 앱 사용자 정보 삭제
   * @Param : user_id
   * @return : 앱 사용자 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  deleteUser(@Param('id') userId: number, delDate: Date) {
    const command = new DeleteUserCommand(userId, delDate);
    return this.commandBus.execute(command);
  }
}
