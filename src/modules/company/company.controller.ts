import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCompanyCommand } from './command/update-company.command';
import { DeleteCompanyCommand } from './command/delete-company.command';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompanyInfoQuery } from './query/get-company-info.query';
import { GetAllCompanyQuery } from './query/get-all-company.query';
import { GetCompanyRequestDto } from './dto/get-company-request.dto';

/**
 * 회원사 API controller
 */
@Controller('company')
export class CompanyController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 회원사 전체 리스트 조회
   * @return : 회원사 리스트 조회 쿼리 전송
   */
  @Get()
  getAllCompany(@Body() param: GetCompanyRequestDto) {
    const getAllCompanyQuery = new GetAllCompanyQuery(param);
    return this.queryBus.execute(getAllCompanyQuery);
  }

  /**
   * 회원사 상세 정보 조회
   * @Param : company_id
   * @return : 회원사 상세 정보 조회 쿼리 전송
   */
  @Get(':id')
  getCompanyInfo(@Param('id') companyId: number) {
    const getCompanyInfoQuery = new GetCompanyInfoQuery(companyId);
    return this.queryBus.execute(getCompanyInfoQuery);
  }

  /**
   * 회원사 상세 정보 수정
   * @Param : company_id
   * @return : 회원사 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  updateCompany(@Param('id') companyId: number, @Body() updateCompanyDto: UpdateCompanyDto) {
    const { companyName, businessNumber } = updateCompanyDto;
    const command = new UpdateCompanyCommand(companyName, businessNumber, companyId);
    return this.commandBus.execute(command);
  }

  /**
   * 회원사 정보 삭제
   * @Param : company_id
   * @return : 회원사 상세 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  deleteCompany(@Param('id') companyId: number, @Body() param: any) {
    const roleId = param.roleId;
    const command = new DeleteCompanyCommand(companyId, roleId);
    return this.commandBus.execute(command);
  }
}
