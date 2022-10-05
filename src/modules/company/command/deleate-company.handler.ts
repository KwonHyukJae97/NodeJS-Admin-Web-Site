import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteCompanyCommand } from './delete-company.command';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

/**
 * 회원사 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteCompanyCommand)
export class DeleteCompanyHandler implements ICommandHandler<DeleteCompanyCommand> {
  constructor(@InjectRepository(Company) private companyRepository: Repository<Company>) {}

  async execute(command: DeleteCompanyCommand) {
    const { companyId } = command;
    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    //softDelete: 데이터를 완전히 삭제하지 않고 삭제일시만 기록 후 update
    this.companyRepository.softDelete({ companyId: companyId });

    //삭제처리 완료 메시지 반환
    return '삭제가 완료 되었습니다.';
  }
}
