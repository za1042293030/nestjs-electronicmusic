import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseCode } from 'src/enum';
import { ExceptionResponse } from 'src/model/response.model';

/**
 * 全局异常过滤器
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorMessage: string =
      (exception.getResponse ? (exception.getResponse() as any) : response)?.message?.toString() ||
      exception.message;
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    response
      .status(status)
      .send(new ExceptionResponse(ResponseCode.FAIL, status, errorMessage, request.url));
  }
}
