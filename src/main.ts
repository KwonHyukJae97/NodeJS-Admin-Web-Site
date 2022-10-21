import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GlobalExceptionFilter } from './common/exception/GlobalException.Filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //CORS 허용
    cors: {
      origin: 'http://localhost:3002',
      credentials: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(3000);
}
bootstrap();
