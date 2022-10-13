import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserCommand } from './update-user.command';
import { User } from '../entities/user.entity';
import { Account } from '../../account/entities/account.entity';
import { Repository } from 'typeorm';
import { TestEvent } from '../event/test.event';
import { FileUpdateEvent } from '../event/file-update-event';

/**
 * 앱 사용자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { password, email, phone, nickname, grade, accountId, file } = command;

    const user = await this.userRepository.findOneBy({ accountId: accountId });
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    user.grade = grade;
    await this.userRepository.save(user);

    account.password = password;
    account.email = email;
    account.phone = phone;
    account.nickname = nickname;
    await this.accountRepository.save(account);

    // 파일 업데이트 이벤트 처리
    this.eventBus.publish(new FileUpdateEvent(account.accountId, file));
    this.eventBus.publish(new TestEvent());

    //수정된 내용 반환
    return account;
  }
}
