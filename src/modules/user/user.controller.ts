import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpUserCommand } from './command/signup-user.command';
import { SignUpUserDto } from './dto/signup-user.dto';
import { GetUserListQuery } from './query/get-user-list.query';
/**
 * 앱사용자 가입/로그인 처리 컨트롤러
 */
@Controller('user')
export class UserController {
  constructor(private commadBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 앱사용자 회원가입 컨트롤러
   */
  @Post()
  async signupUser(@Body(ValidationPipe) signUpUserdto: SignUpUserDto): Promise<void> {
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

    return this.commadBus.execute(command);
  }

  /**
   * 앱 사용자 조회
   */
  @Get()
  async getAllUsers() {
    const getUserListQuery = new GetUserListQuery();
    return this.queryBus.execute(getUserListQuery);
  }
}
