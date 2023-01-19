import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAdminCommand } from './command/create-admin.command';
import { DeleteAdminCommand } from './command/delete-admin.command';
import { UpdateAdminCommand } from './command/update-admin.command';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { GetAdminInfoQuery } from './query/get-admin-info.query';
import { GetAllAdminQuery } from './query/get-all-admin.query';
import { AdminUpdateInfoDto } from '../auth/dto/admin-update-info.dto';
import { AdminUpdateInfoCommand } from './command/admin-update-info.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';

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
   * TODO: 관리자 전체 정보 수정
   * @param : adminId
   * @returns : 관리자 정보 수정 커맨드 전송
   */
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 1))
  updateAdmin(
    @Param('id') adminId: number,
    @Body() dto: UpdateAdminDto,
    @UploadedFiles() files: Express.MulterS3.File[],
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
      files,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 관리자 상세 내정보 수정
   * @returns : 관리자 정보 수정 커맨드 전송
   */
  @Patch('me')
  @UseInterceptors(FilesInterceptor('files', 1))
  updateInfo(@Body() dto: AdminUpdateInfoDto, @UploadedFiles() files: Express.MulterS3.File[]) {
    const { accountId, email, phone, nickname } = dto;
    const command = new AdminUpdateInfoCommand(accountId, email, phone, nickname, files);

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
