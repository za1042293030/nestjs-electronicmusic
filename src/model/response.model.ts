import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/enum';

/**
 * 请求结果模型
 */
class BaseResponse<T = unknown> {
  public code: ResponseCode;
  public message: string;
  public data: T;

  constructor(code: ResponseCode, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

/**
 * 请求异常结果模型
 */
class ExceptionResponse extends BaseResponse<null> {
  public status: HttpStatus;
  public errorUrl: string;
  
  constructor(code: ResponseCode, status: HttpStatus, errorMessage: string, errorUrl: string) {
    super(code, errorMessage, null);
    this.status = status;
    this.errorUrl = errorUrl;
  }
}

export { ExceptionResponse, BaseResponse };
