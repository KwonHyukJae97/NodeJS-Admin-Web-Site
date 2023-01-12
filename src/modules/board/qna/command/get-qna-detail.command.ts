import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account.entity';

/**
 * 1:1 문의 상세 정보 조회용 커멘드 정의
 */
export class GetQnaDetailCommand implements ICommand {
  constructor(readonly qnaId: number, readonly account: Account) {}
}
