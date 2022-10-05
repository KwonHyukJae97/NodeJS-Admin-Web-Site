import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCompanyCommand } from './command/update-company.command';
import { DeleteCompanyCommand } from './command/delete-company.command';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompanyInfoQuery } from './query/get-company-info.query';

/**
 * 회원사 API controller
 */
@Controller('company')
export class CompanyController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 회원사 상세 정보 조회
   * @Param : company_id
   */
  @Get(':id')
  getCompanyInfo(@Param('id') companyId: number) {
    const getCompanyInfoQuery = new GetCompanyInfoQuery(companyId);
    return this.queryBus.execute(getCompanyInfoQuery);
  }

  /**
   * 회원사 상세 정보 수정
   * @Param : company_id
   */
  @Patch(':id')
  updateCompany(@Param('id') companyId: number, @Body() dto: UpdateCompanyDto) {
    const { companyName, companyCode } = dto;
    const command = new UpdateCompanyCommand(companyName, companyCode, companyId);

    return this.commandBus.execute(command);
  }

  /**
   * 회원사 정보 삭제
   * @param : company_id
   */
  @Delete(':id')
  deleteCompany(@Param('id') companyId: number) {
    const command = new DeleteCompanyCommand(companyId);
    return this.commandBus.execute(command);
  }
}
