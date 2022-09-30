import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpUserCommand } from '../auth/command/signup-user.command';
import { SignUpUserDto } from '../auth/dto/signup-user.dto';

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

    return this.commadBus.execute(command);
  }
}
