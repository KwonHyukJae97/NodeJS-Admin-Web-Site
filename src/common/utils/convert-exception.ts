import { HttpException, UseFilters } from '@nestjs/common';
import { TranslatorService, TranslatorFilter } from 'nestjs-translator';

/**
 * Exception 처리 메소드
 * @param msg : 에러메시지명 정의
 * @param param : 에러메시지에 함께 표시할 파라미터 정의
 * @param status : HTTP Exception 에러 코드
 */
@UseFilters(TranslatorFilter)
export class ConvertException {
  constructor(private translator: TranslatorService) {}

  async throwError(msg: string, param: string, status: number) {
    throw new HttpException(this.translator.translate(msg, { replace: { param: param } }), status);
  }
}
