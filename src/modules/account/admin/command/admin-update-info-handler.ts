import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
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
    console.log('핸들러 체크', accountId);
    console.log('핸들러 체크', email);

    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //404 not found 에러처리 추가
    if (!account) {
      return this.convertException.notFoundError('관리자', 404);
    }

    let result = await this.commonUpdate(
      accountId,
      email,
      { email },
      {
        email: email,
      },
      '이미 존재하는 이메일이므로 수정',
    );

    if (result != null) {
      return result;
    }

    result = await this.commonUpdate(
      accountId,
      phone,
      { phone },
      {
        phone: phone,
      },
      '이미 존재하는 연락처이므로 수정',
    );

    if (result != null) {
      return result;
    }

    result = await this.commonUpdate(
      accountId,
      nickname,
      { nickname },
      {
        nickname: nickname,
      },
      '이미 존재하는 닉네임이므로 수정',
    );

    if (result != null) {
      return result;
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

  //수정하는 기능 동일한 작업을 하는 부분을 메소드로 따로 빼기
  commonUpdate = async function (accountId, targetObj, whereObj, updateObj, errorMsg) {
    if (!targetObj) {
      return null;
    }

    try {
      const isExist = await this.accountRepository.findOne({ where: whereObj });
      if (isExist) {
        return this.convertException.badRequestAccountError(errorMsg, 400);
      } else {
        const updateResult = this.accountRepository.update({ accountId }, updateObj);

        return updateResult;
      }
    } catch (err) {
      console.log(err);
    }

    return null;
  };
}
