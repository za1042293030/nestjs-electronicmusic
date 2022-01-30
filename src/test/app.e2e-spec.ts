import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { BaseResponse } from 'src/model/response.model';
import { ResponseCode } from 'src/enum';
import { GlobalExceptionFilter } from 'src/filter';
import { GlobalResponseInterceptor } from 'src/interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new GlobalResponseInterceptor());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/user/getUserByUserName?userName=test')
      .expect(200)
      .expect(new BaseResponse(ResponseCode.SUCCESS, 'ok', '服务器正常运行'));
  });
});
