import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * 전역으로 에러 핸들링 하기 위한 클래스
 */

// ()를 공란으로 두어 모든 예외처리를 받음.
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = (exception as any).message.message;
    let code = 'HttpException';

    switch (exception.constructor) {
      // HttpException
      case HttpException:
        status = (exception as HttpException).getStatus();
        break;

      // TypeOrm error
      case QueryFailedError:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as QueryFailedError).message;
        code = (exception as any).code;
        break;

      // default
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // 요청 url 및 에러 정보
    const url = request.url;
    const errorMessage = (exception as any).message;
    const timeStamp = new Date().toISOString();
    const res: any = (exception as HttpException).getResponse();

    console.log('요청 url: ', url);
    console.log('error 정보: ', res.error);
    console.log('message:', errorMessage);
    console.log('발생 시간: ', timeStamp);

    // 에러 정보 클라이언트에게 반환
    response.status(status).json({
      success: false,
      statusCode: status,
      message: errorMessage,
      path: url,
    });
  }
}
