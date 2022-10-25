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

  /**
   * 회원사 정보 수정 메소드
   * @param command : 회원사 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 회원사 정보 반환
   */
  async execute(command: UpdateCompanyCommand) {
    const { companyName, companyCode, companyId } = command;

    const company = await this.companyRepository.findOneBy({ companyId: companyId });

    if (!company) {
      return this.convertException.notFoundError('회원사', 404);
    }

    company.companyName = companyName;
    company.companyCode = companyCode;

    //회원사 정보 DB저장
    try {
      await this.companyRepository.save(company);
    } catch (err) {
      return this.convertException.badRequestError('회원사 정보에 ', 400);
    }

    return company;
  }
}
