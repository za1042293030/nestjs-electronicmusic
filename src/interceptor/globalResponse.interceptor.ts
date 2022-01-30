import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseCode } from 'src/enum';
import { BaseResponse } from 'src/model/response.model';
import { MESSAGE_OK } from 'src/constant';

/**
 * 全局请求结果拦截器
 */
@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        //返回请求结果model
        return new BaseResponse(ResponseCode.SUCCESS, MESSAGE_OK, data);
      }),
    );
  }
}
