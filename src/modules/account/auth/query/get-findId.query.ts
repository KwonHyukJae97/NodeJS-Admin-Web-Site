import { IQuery } from '@nestjs/cqrs';
import { FindIdDto } from '../dto/findid.dto';

/**
 * 아이디 찾기 쿼리
 */
export class GetFindIdQuery implements IQuery {
  constructor(readonly param: FindIdDto) {}
}
