import { IQuery } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';
import { GetCommentRequestDto } from '../dto/get-comment-request.dto';

/**
 * 답변 전체 리스트 조회용 쿼리
 */
export class GetCommentListQuery implements IQuery {
  constructor(readonly param: GetCommentRequestDto) {}
}
