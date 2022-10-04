import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { SignUpAdminDto } from './dto/signup-admin.dto';
import { SignUpUserDto } from './dto/signup-user.dto';

/**
 * 회원가입, 로그인 등 계정 관련 auth 컨트롤러
 */
@Controller('auth')
export class SignController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  /**
   * 앱 사용자 회원가입 요청
   * 1차 정보 입력
   */

  @Post('/register/admin')
  async signUpAdmin(@Body(ValidationPipe) SignUpAdminDto: SignUpAdminDto): Promise<string> {
    const {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    } = SignUpAdminDto;
    console.log('컨트롤러 나오냐!!!!로그', SignUpAdminDto);
    const command = new SignUpAdminCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    );
    return this.commandBus.execute(command);
  }

  @Post('/register/user')
  async signUpUser(@Body(ValidationPipe) SignUpUserDto: SignUpUserDto): Promise<string> {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = SignUpUserDto;

    console.log('컨트롤러 로그', SignUpUserDto);
    const command = new SignUpUserCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      grade,
    );
    return this.commandBus.execute(command);
  }

  // @Post('/login/user')
  // async signin(@Body() signInUserDto: SignInUserDto): Promise<string> {
  //   const { id, password } = signInUserDto;

  //   const command = new SignInUserCommand(id, password);

  //   return this.commandBus.execute(command);
  // }
}
