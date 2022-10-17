import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { DeleteAdminCommand } from './delete-admin.command';

@Injectable()
@CommandHandler(DeleteAdminCommand)
export class DeleteAdminHandler implements ICommandHandler<DeleteAdminCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private eventBus: EventBus,
  ) {}
  async execute(command: DeleteAdminCommand) {
    const { accountId, delDate } = command;
    const account = await this.accountRepository.findOneBy({ accountId: accountId, delDate });

    // new Date()에서 반환하는 UTC시간을 KST시간으로 변경
    const getDate = new Date();
    getDate.setHours(getDate.getHours() + 9);
    const setDate = getDate;

    //탈퇴회원의 이용내역 조회를 위해 delete하지 않고 삭제일시를 별도로 저장하여 데이터 보존
    account.delDate = setDate;
    await this.accountRepository.save(account);

    //탈퇴회원의 개인정보 유출가능한 데이터는 *표로 표시 (기준:휴면계정 데이터)
    await this.accountRepository
      .createQueryBuilder()
      .update(account)
      .set({
        password: '*****',
        id: '*****',
        name: '*****',
        phone: '*****',
        email: '*****',
        birth: '*****',
        snsId: '*****',
        snsType: '**',
        gender: '*',
        ci: '*****',
      })
      .where('account.account_id = :accountId', { accountId: accountId })
      .execute();

    return '삭제 완료~';
  }
}
