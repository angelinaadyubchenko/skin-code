import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './http-exception.filter';
const hbs = require('hbs');
const session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  app.set('view options', { layout: 'layouts/main' });

  hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  hbs.registerHelper('lowercase', (str: string) => (str ?? '').toLowerCase());
  hbs.registerHelper('multiply', (a: number, b: number) => a * b);
  hbs.registerHelper('subtract', (a: number, b: number) => a - b);
  hbs.registerHelper('times', function (n: number, options: { fn: (ctx: unknown) => string }) {
    return Array.from({ length: n }, (_, i) => options.fn(i)).join('');
  });

  app.use(session({
    secret: 'myskincode-secret',
    resave: false,
    saveUninitialized: false,
  }));

  app.use('/graphql', (req, res, next) => {
    const start = Date.now();
    let handled = false;
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const withElapsedTime = (body: unknown, sender: (payload?: unknown) => typeof res) => {
      if (!handled && !res.headersSent) {
        handled = true;
        res.setHeader('X-Elapsed-Time', `${Date.now() - start}ms`);
        console.log(`[${req.method}] ${req.originalUrl} — ${Date.now() - start}ms`);
      }
      return sender(body);
    };

    res.json = (body?: unknown) => withElapsedTime(body, originalJson);
    res.send = (body?: unknown) => withElapsedTime(body, originalSend);

    next();
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('My Skin Code API')
    .setDescription('REST API интернет-магазина косметики')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
