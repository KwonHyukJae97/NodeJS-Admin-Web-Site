import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { AdminUpdateInfoCommand } from './admin-update-info.command';
import { FileType } from '../../../file/entities/file-type.enum';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { AccountFileDb } from '../../account-file-db';
import { UpdateFilesCommand } from '../../../file/command/update-files.command';
import { CreateFilesCommand } from '../../../file/command/create-files.command';

/**
 * 관리자 상세 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(AdminUpdateInfoCommand)
export class AdminUpdateInfoHandler implements ICommandHandler<AdminUpdateInfoCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
    @Inject('accountFile') private accountFileDb: AccountFileDb,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 관리자 정보 수정 메소드
   * @param command : 관리자 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: AdminUpdateInfoCommand) {
    const { accountId, email, phone, nickname, files } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //404 not found 에러처리 추가
    if (!account) {
      return this.convertException.notFoundError('관리자', 404);
    }

    if (email) {
      try {
        // const isEmailExist = this.accountRepository.findOneBy( {email} )
        const isEmailExist = await this.accountRepository.findOne({ where: { email } });
        if (isEmailExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 이메일이므로 수정',
            400,
          );
        } else {
          const updateEmail = this.accountRepository.update(
            { accountId },
            {
              email: email,
            },
          );
          console.log(updateEmail);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (phone) {
      try {
        const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
        if (isPhoneExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 연락처이므로 수정',
            400,
          );
        } else {
          const updatePhone = this.accountRepository.update(
            {
              accountId,
            },
            {
              phone: phone,
            },
          );
          console.log(updatePhone);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (nickname) {
      try {
        const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
        if (isNicknameExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 닉네임이므로 수정',
            400,
          );
        } else {
          const updateNickname = this.accountRepository.update(
            {
              accountId,
            },
            {
              nickname: nickname,
            },
          );
          console.log(updateNickname);
        }
      } catch (err) {
        console.log(err);
      }
    }

    const accountFile = await this.fileRepository.findOneBy({ accountId: accountId });

    if (files.length !== 0) {
      // 저장되어 있는 프로필 이미지가 있다면 '수정' 이벤트 호출
      if (accountFile) {
        const command = new UpdateFilesCommand(
          accountId,
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
          accountId,
          FileType.ACCOUNT,
          null,
          files,
          this.accountFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }
    }

    return account;
  }
}
