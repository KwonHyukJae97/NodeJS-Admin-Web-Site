import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { User } from '../entities/user';
import { DeleteUserCommand } from './delete-user.command';

/**
 * 앱 사용자 정보 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
  ) {}

  /**
   * 앱 사용자 삭제 메소드
   * @param command : 앱 사용자 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteUserCommand) {
    const { userId, delDate } = command;
    const user = await this.userRepository.findOneBy({ userId: userId });

    const accountId = user.accountId.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId, delDate });

    if (!account) {
      return this.convertException.notFoundError('사용자', 404);
    }
    // new Date()에서 반환하는 UTC시간을 KST시간으로 변경
    const getDate = new Date();
    getDate.setHours(getDate.getHours() + 9);
    const setDate = getDate;

    //탈퇴회원의 이용내역 조회를 위해 delete하지 않고 삭제일시를 별도로 저장하여 데이터 보존
    account.delDate = setDate;
    await this.accountRepository.save(account);

    //탈퇴회원의 개인정보 유출가능한 데이터는 *표로 표시 (기준:휴면계정 데이터)
    try {
      await this.accountRepository
        .createQueryBuilder()
        .update(account)
        .set({
          password: '*****',
          id: '*****',
          name: '*****',
          phone: '*****',
          nickname: '*****',
          email: '*****',
          birth: '*****',
          snsId: '*****',
          snsType: '**',
          gender: '*',
          ci: '*****',
        })
        .where('account.account_id = :accountId', { accountId: accountId })
        .execute();
    } catch (err) {
      console.log(err);
      return this.convertException.CommonError(500);
    }

    return '삭제가 완료 되었습니다.';
  }
}
