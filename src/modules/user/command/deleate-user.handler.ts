import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteUserCommand } from './delete-user.command';
import { Account } from '../../account/entities/account.entity';
import { Repository } from 'typeorm';

/**
 * 앱 사용자 정보 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(@InjectRepository(Account) private accountRepository: Repository<Account>) {}

  async execute(command: DeleteUserCommand) {
    const { accountId, delDate } = command;
    const account = await this.accountRepository.findOneBy({ accountId: accountId, delDate });

    // new Date()에서 반환하는 UTC시간을 KST시간으로 변경
    const getDate = new Date();
    getDate.setHours(getDate.getHours() + 9);
    const setDate = getDate;

    account.delDate = setDate;

    this.accountRepository.save(account);

    //삭제처리된 내용 반환
    return account;
  }
}
