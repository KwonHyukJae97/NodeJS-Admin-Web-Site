import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpAdminDto } from './dto/signup-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private commadBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 앱사용자 회원가입 컨트롤러
   */
  @Post()
  async signupAdmin(@Body() signUpAdmindto: SignUpAdminDto): Promise<void> {
    const {
      id,
      password,
      email,
      name,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    } = signUpAdmindto;

    const command = new SignUpAdminCommand(
      id,
      password,
      email,
      name,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    );

    return this.commadBus.execute(command);
  }
}
