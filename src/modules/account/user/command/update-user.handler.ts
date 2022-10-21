import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserCommand } from './update-user.command';
import { User } from '../entities/user';
import { Account } from '../../entities/account';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AccountFileDb } from '../../account-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { FileUpdateEvent } from '../../../file/event/file-update-event';
import { ConvertException } from 'src/common/utils/convert-exception';
import { AccountFile } from '../../../file/entities/account-file';
import { FileCreateEvent } from '../../../file/event/file-create-event';

/**
 * 앱 사용자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
    @Inject('accountFile') private accountFileDb: AccountFileDb,
    private eventBus: EventBus,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 앱 사용자 정보 수정 메소드
   * @param command : 앱 사용자 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: UpdateUserCommand) {
    const { password, email, phone, nickname, grade, userId, file } = command;

    const user = await this.userRepository.findOneBy({ userId: userId });
    const accountId = user.accountId.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //학년정보 수정
    try {
      user.grade = grade;
      await this.userRepository.save(user);
    } catch (err) {
      return this.convertException.badRequestError('학년정보에', 400);
    }

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('패스워드 확인', hashedPassword);

    //계정 정보 수정
    try {
      account.password = hashedPassword;
      account.email = email;
      account.phone = phone;
      account.nickname = nickname;
      await this.accountRepository.save(account);
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    const accountFile = await this.fileRepository.findOneBy({ accountId: accountId });

    if (file) {
      // 저장되어 있는 프로필 이미지가 있다면 '수정' 이벤트 호출
      if (accountFile) {
        this.eventBus.publish(
          new FileUpdateEvent(accountId, FileType.ACCOUNT, file, this.accountFileDb),
        );
        // 저장되어 있는 프로필 이미지가 없다면 '등록' 이벤트 호출
      } else {
        this.eventBus.publish(
          new FileCreateEvent(accountId, FileType.ACCOUNT, file, this.accountFileDb),
        );
      }
    }

    return account;
  }
}
