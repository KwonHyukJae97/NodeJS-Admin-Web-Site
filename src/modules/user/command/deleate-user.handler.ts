import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteUserCommand } from './delete-user.command';
import { Account } from '../../account/entities/account.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AccountFile } from 'src/modules/account/file/entities/account-file';

/**
 * 앱 사용자 정보 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(User) private userRepository: Repository<User>,
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

    account.delDate = setDate;
    await this.accountRepository.save(account);

    this.accountFileRepository.delete({ accountId: accountId });

    //삭제처리된 내용 반환
    return account;
  }
}
