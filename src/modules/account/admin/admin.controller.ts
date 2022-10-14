import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAdminCommand } from '../auth/command/signup-admin.command';
import { SignUpAdminDto } from '../auth/dto/signup-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 관리자 회원가입 컨트롤러
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
      division,
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
      division,
    );

    return this.commandBus.execute(command);
  }
}
