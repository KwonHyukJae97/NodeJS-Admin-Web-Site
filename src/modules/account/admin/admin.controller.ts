import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignUpAdminCommand } from '../auth/command/signup-admin.command';
import { SignUpAdminDto } from '../auth/dto/signup-admin.dto';
import { CreateAdminCommand } from './command/create-admin.command';
import { DeleteAdminCommand } from './command/delete-admin.command';
import { UpdateAdminCommand } from './command/update-admin.command';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { GetAdminInfoQuery } from './query/get-admin-info.query';
import { GetAllAdminQuery } from './query/get-all-admin.query';

@Controller('admin')
export class AdminController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 관리자 회원가입 컨트롤러
   */
  // @Post()
  // async signupAdmin(@Body() signUpAdmindto: SignUpAdminDto): Promise<void> {
  //   const {
  //     id,
  //     password,
  //     email,
  //     name,
  //     phone,
  //     nickname,
  //     birth,
  //     gender,
  //     companyId,
  //     roleId,
  //     isSuper,
  //     division,
  //   } = signUpAdmindto;

  //   const command = new SignUpAdminCommand(
  //     id,
  //     password,
  //     email,
  //     name,
  //     phone,
  //     nickname,
  //     birth,
  //     gender,
  //     companyId,
  //     roleId,
  //     isSuper,
  //     division,
  //   );

  //   return this.commandBus.execute(command);
  // }

  /**
   * 관리자 전체 리스트 조회
   */
  @Get()
  getAllAdmin() {
    const getAllAdminQuery = new GetAllAdminQuery();
    return this.queryBus.execute(getAllAdminQuery);
  }

  /**
   * 관리자 상세 정보 조회
   * @Param : user_id
   */
  @Get(':id')
  getAdminInfo(@Param('id') adminId: number) {
    const getAdminInfoQuery = new GetAdminInfoQuery(adminId);
    return this.queryBus.execute(getAdminInfoQuery);
  }

  /**
   * 관리자 상세 정보 수정
   * @Param : user_id
   */
  @Patch(':id')
  updateAdmin(@Param('id') adminId: number, @Body() dto: UpdateAdminDto) {
    const { password, email, phone, nickname, roleId, isSuper } = dto;
    const command = new UpdateAdminCommand(
      password,
      email,
      phone,
      nickname,
      roleId,
      isSuper,
      adminId,
    );

    return this.commandBus.execute(command);
  }

  @Post()
  async createAdmin(@Body(ValidationPipe) dto: CreateAdminDto): Promise<string> {
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
      division,
    } = dto;
    console.log('Admin 등록 로그', dto);
    const command = new CreateAdminCommand(
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
      division,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 관리자 정보 삭제
   * @ param : user_id
   */
  @Delete(':id')
  deleteAdmin(@Param('id') adminId: number, delDate: Date) {
    const command = new DeleteAdminCommand(adminId, delDate);
    return this.commandBus.execute(command);
  }
}
