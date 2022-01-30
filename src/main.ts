import { join, resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/filter/globalException.filter';
import { GlobalResponseInterceptor } from 'src/interceptor/globalResponse.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());
  //全局响应拦截器
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  //设置静态目录
  app.useStaticAssets(join(__dirname, '..', 'upload'));
  //文档
  const config = new DocumentBuilder().setTitle('电子音乐网站').setDescription('张翱毕业设计（电子音乐网站）后端文档').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(3001);
}
bootstrap();
