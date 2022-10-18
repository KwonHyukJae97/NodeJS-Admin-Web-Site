import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpUserCommand } from '../auth/command/signup-user.command';
import { SignUpUserDto } from '../auth/dto/signup-user.dto';
import { DeleteUserCommand } from './command/delete-user.command';
import { UpdateUserCommand } from './command/update-user.command';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUserQuery } from './query/get-all-user.query';
import { GetUserInfoQuery } from './query/get-user-info.query';

/**
 * 앱사용자 가입/로그인 처리 컨트롤러
 */
@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 앱사용자 회원가입 컨트롤러
   */
  @Post()
  async secondSignupUser(@Body(ValidationPipe) signUpUserdto: SignUpUserDto): Promise<void> {
    const { id, password, email, name, phone, nickname, birth, gender, grade } = signUpUserdto;

    const command = new SignUpUserCommand(
      id,
      password,
      email,
      name,
      phone,
      nickname,
      birth,
      gender,
      grade,
    );

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
   * @Param : user_id
   */
  @Get(':id')
  getUserInfo(@Param('id') userId: number) {
    const getUserInfoQuery = new GetUserInfoQuery(userId);
    return this.queryBus.execute(getUserInfoQuery);
  }

  /**
   * 앱사용자 상세 정보 수정
   * @Param : user_id
   */
  @Patch(':id')
  updateUser(@Param('id') userId: number, @Body() dto: UpdateUserDto) {
    const { password, email, phone, nickname, grade } = dto;
    const command = new UpdateUserCommand(password, email, phone, nickname, grade, userId);

    return this.commandBus.execute(command);
  }

  /**
   * 앱 사용자 정보 삭제
   * @ param : user_id
   */
  @Delete(':id')
  deleteUser(@Param('id') userId: number, delDate: Date) {
    const command = new DeleteUserCommand(userId, delDate);
    return this.commandBus.execute(command);
  }
}
