import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCompanyCommand } from './update-company.command';
import { Company } from '../entities/company.entity';
import { Repository } from 'typeorm';

/**
 * 회원사 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateCompanyCommand)
export class UpdateCompanyHandler implements ICommandHandler<UpdateCompanyCommand> {
  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

  async execute(command: UpdateCompanyCommand) {
    const { companyName, companyCode, companyId } = command;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    company.companyName = companyName;
    company.companyCode = companyCode;
    await this.companyRepository.save(company);

    //수정된 내용 반환
    return company;
  }
}
