import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './utils/interceptors/logger.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  const swagger = new DocumentBuilder().setVersion('1.0').build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('property-doc', app, documentation);

  await app.listen(process.env.PORT ?? 3000); //
}

bootstrap();
