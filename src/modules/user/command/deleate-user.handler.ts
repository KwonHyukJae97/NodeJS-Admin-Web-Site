import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteUserCommand } from './delete-user.command';
import { Account } from '../../account/entities/account.entity';
import { Repository } from 'typeorm';
import { AccountFile } from 'src/modules/account/file/entities/account-file';

/**
 * 앱 사용자 정보 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(AccountFile) private accountFileRepository: Repository<AccountFile>,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { accountId, delDate } = command;
    const account = await this.accountRepository.findOneBy({ accountId: accountId, delDate });
    const file = await this.accountFileRepository.findBy({ accountId: accountId });

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

    //account_file DB 삭제
    this.accountFileRepository.delete({ accountId: accountId });

    //삭제처리 메시지 반환
    return '삭제가 완료 되었습니다.';
  }
}
