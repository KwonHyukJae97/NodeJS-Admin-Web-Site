import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCompanyCommand } from './update-company.command';
import { Company } from '../entities/company.entity';
import { Repository } from 'typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
/**
 * 회원사 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateCompanyCommand)
export class UpdateCompanyHandler implements ICommandHandler<UpdateCompanyCommand> {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: UpdateCompanyCommand) {
    const { companyName, companyCode, companyId } = command;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    if (!company) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '회원사', 404);
    }

    company.companyName = companyName;
    company.companyCode = companyCode;

    //회원사 정보 DB저장
    try {
      await this.companyRepository.save(company);
    } catch (err) {
      console.log(err);
      //저장 실패할 경우 에러 메시지 반환
      return this.convertException.throwError('badInput', '회원사 정보에 ', 400);
    }

    //수정된 내용 반환
    return company;
  }
}
