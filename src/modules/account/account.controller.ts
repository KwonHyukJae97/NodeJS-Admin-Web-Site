import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetAccountCommand } from './command/get-account.command';
import { GetAccountDto } from './dto/get-account.dto';
import { Account } from './entities/account.entity';
import { GetAccountQuery } from './query/get-account.query';

/**
 * Account 에서 로그인 기간이 1년이상 지난 사용자 추출 컨트롤러
 */
@Controller('account')
export class AccountContoller {
  constructor(private queryBus: QueryBus) {}

  /**
   *
   * @param accountId
   * @param getAccountDto
   * @returns
   */
  // @Get('/:id')
  // async getAccountLoginDate(
  //   @Param('id') accountId: number,
  //   @Body() getAccountDto: GetAccountDto,
  // ): Promise<Account> {
  //   const { loginDate } = getAccountDto;
  //   const command = new GetAccountCommand(accountId, loginDate);

  //   console.log('로그인 데이트 체크 테스트', command);
  //   return this.queryBus.execute(command);
  // }

  @Get('/:id')
  getAccountLoginDate(@Param('id') accountId: number) {
    const getAccountLoginDateQuery = new GetAccountQuery(accountId);
    return this.queryBus.execute(getAccountLoginDateQuery);
  }
}
