import { HttpException, UseFilters } from '@nestjs/common';
import { TranslatorService, TranslatorFilter } from 'nestjs-translator';

/**
 * Exception 처리를 위한 클래스
 */
@UseFilters(TranslatorFilter)
export class ConvertException {
  constructor(private translator: TranslatorService) {}

  /**
   * NotFound Exception 처리
   * @param param : 에러메시지에 함께 표시할 파라미터 정의
   * @param status : HTTP Exception 에러 코드
   */
  async notFoundError(param: string, status: number) {
    throw new HttpException(
      this.translator.translate('notFound', { replace: { param: param } }),
      status,
    );
  }

  /**
   * BadRequest Exception 처리
   * @param param : 에러메시지에 함께 표시할 파라미터 정의
   * @param status : HTTP Exception 에러 코드
   */
  async badRequestError(param: string, status: number) {
    throw new HttpException(
      this.translator.translate('badInput', { replace: { param: param } }),
      status,
    );
  }

  /**
   * S3 BadRequest Exception 처리
   * @param param : 에러메시지에 함께 표시할 파라미터 정의
   * @param status : HTTP Exception 에러 코드
   */
  async badRequestS3Error(param: string, status: number) {
    throw new HttpException(
      this.translator.translate('badRequestS3', { replace: { param: param } }),
      status,
    );
  }

  /**
   * 계정 관련 BadRequest Exception 처리
   * @param param : 에러메시지에 함께 표시할 파라미터 정의
   * @param status : HTTP Exception 에러 코드
   */
  async badRequestAccountError(param: string, status: number) {
    throw new HttpException(
      this.translator.translate('badRequestAccount', { replace: { param: param } }),
      status,
    );
  }

  /**
   * 기타 Exception 처리
   * @param param : 에러메시지에 함께 표시할 파라미터 정의
   * @param status : HTTP Exception 에러 코드
   */
  async CommonError(status: number) {
    throw new HttpException(
      this.translator.translate('commonError', { replace: { param: '' } }),
      status,
    );
  }
}
