import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserCommand } from './update-user.command';
import { User } from '../entities/user';
import { Account } from '../../entities/account';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AccountFileDb } from '../../account-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from 'src/common/utils/convert-exception';
import { AccountFile } from '../../../file/entities/account-file';
import { UpdateFilesCommand } from '../../../file/command/update-files.command';
import { CreateFilesCommand } from '../../../file/command/create-files.command';

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
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
    private commandBus: CommandBus,
  ) {}

  /**
   * 앱 사용자 정보 수정 메소드
   * @param command : 앱 사용자 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: UpdateUserCommand) {
    const { password, email, phone, nickname, grade, userId, files } = command;

    const user = await this.userRepository.findOneBy({ userId: userId });
    const accountId = user.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //트랜잭션 생성 후 연결 및 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('패스워드 확인', hashedPassword);

    //학년정보 수정
    try {
      user.grade = grade;
      await queryRunner.manager.getRepository(User).save(user);

      account.password = hashedPassword;
      account.email = email;
      account.phone = phone;
      account.nickname = nickname;

      await queryRunner.manager.getRepository(Account).save(account);

      const accountFile = await this.fileRepository.findOneBy({ accountId: account.accountId });

      if (files.length !== 0) {
        // 저장되어 있는 프로필 이미지가 있다면 '수정' 이벤트 호출
        if (accountFile) {
          const command = new UpdateFilesCommand(
            account.accountId,
            FileType.ACCOUNT,
            null,
            files,
            this.accountFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
          // 저장되어 있는 프로필 이미지가 없다면 '등록' 이벤트 호출
        } else {
          const command = new CreateFilesCommand(
            account.accountId,
            FileType.ACCOUNT,
            null,
            files,
            this.accountFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
        }
      }

      await queryRunner.commitTransaction();
      return account;
    } catch (err) {
      return this.convertException.badRequestError('정보 수정에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
