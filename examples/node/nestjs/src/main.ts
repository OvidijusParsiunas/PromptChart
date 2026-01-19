import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`PromptChart backend running at http://localhost:${port}`);
  console.log(`API endpoint: POST http://localhost:${port}/api/chart`);
}

bootstrap();
