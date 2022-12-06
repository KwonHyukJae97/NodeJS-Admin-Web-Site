import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminUpdateInfoDto } from '../auth/dto/admin-update-info.dto';
import { AdminUpdateInfoCommand } from '../auth/command/admin-update-info.command';

/**
 * 관리자 정보 조회, 수정, 삭제 처리 API Controller
 */
@Controller('admin')
export class AdminController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 관리자 전체 리스트 조회
   * @returns : 관리자 리스트 조회 커맨드 전송
   */
  @Get()
  getAllAdmin() {
    const getAllAdminQuery = new GetAllAdminQuery();
    return this.queryBus.execute(getAllAdminQuery);
  }

  /**
   * 관리자 상세 정보 조회
   * @param : adminId
   * @returns : 관리자 상세 정보 조회 쿼리 전송
   */
  @Get(':id')
  getAdminInfo(@Param('id') adminId: number) {
    const getAdminInfoQuery = new GetAdminInfoQuery(adminId);
    return this.queryBus.execute(getAdminInfoQuery);
  }

  /**
   * 관리자 전체 정보 수정
   * @param : adminId
   * @returns : 관리자 정보 수정 커맨드 전송
   */
  @Patch('/admin/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateAdmin(
    @Param('id') adminId: number,
    @Body() dto: UpdateAdminDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const { password, email, phone, nickname, roleId, isSuper } = dto;
    const command = new UpdateAdminCommand(
      password,
      email,
      phone,
      nickname,
      roleId,
      isSuper,
      adminId,
      file,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 관리자 상세 내정보 수정
   * @param : adminId
   * @returns : 관리자 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateInfo(
    @Param('id') accountId: number,
    @Body() dto: AdminUpdateInfoDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const { email, phone, nickname } = dto;
    console.log('수정 데이터111?', email);
    console.log('수정 데이터222?', phone);
    console.log('수정 데이터333?', nickname);
    const command = new AdminUpdateInfoCommand(accountId, email, phone, nickname, file);
    return this.commandBus.execute(command);
  }

  /**
   * 관리자 정보 등록
   * @param : dto
   * @returns : 관리자 정보 등록 커맨드 전송
   */
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
      companyName,
      companyCode,
      businessNumber,
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
      companyName,
      companyCode,
      businessNumber,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 관리자 정보 삭제
   * @Param : admin_id
   * @return : 관리자 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  deleteAdmin(@Param('id') adminId: number, delDate: Date) {
    const command = new DeleteAdminCommand(adminId, delDate);
    return this.commandBus.execute(command);
  }
}
