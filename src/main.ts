import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './utils/interceptors/logger.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //بورت جماعة الفرونت مشان cors المتصفح
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  //عدنا مرجع
  const swagger = new DocumentBuilder().setVersion('1.0').build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('property-doc', app, documentation);

  await app.listen(process.env.PORT ?? 3000); //
}

bootstrap();
