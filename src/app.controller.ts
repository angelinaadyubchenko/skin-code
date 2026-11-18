import { Body, Controller, Get, Post, Req, Res, Render } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getIndex(@Req() req: Request, @Res() res: Response) {
    return res.render('index', {
      user: req.session['user'] || null,
      isIndex: true,
      products: [
        { id: 1, rank: 1, name: 'Увлажняющий крем', description: 'Интенсивное увлажнение', image: 'product1.jpg', price: 1200 },
        { id: 2, rank: 2, name: 'Сыворотка Vitamin C', description: 'Сияние и ровный тон', image: 'product2.jpg', price: 1400 },
        { id: 3, rank: 3, name: 'Пенка для умывания', description: 'Мягкое очищение', image: 'product3.jpg', price: 900 },
        { id: 4, rank: 4, name: 'Солнцезащитный SPF50', description: 'Защита от солнца', image: 'product4.jpg', price: 1500 },
      ],
    });
  }

  @Get('graphql')
  getGraphqlSandbox(@Req() req: Request, @Res() res: Response) {
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol;
    const host = req.get('host');
    const endpoint = `${protocol}://${host}/graphql`;

    return res.type('html').send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GraphQL Sandbox</title>
    <style>
      html, body, #sandbox {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="sandbox"></div>
    <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
    <script>
      new window.EmbeddedSandbox({
        target: '#sandbox',
        initialEndpoint: '${endpoint}',
        includeCookies: false,
      });
    </script>
  </body>
</html>`);
  }

  @Get('login')
  getLogin(@Req() req: Request, @Res() res: Response) {
    if (req.session['user']) {
      return res.redirect('/');
    }

    return res.render('auth/login', {
      user: null,
      title: 'Вход',
    });
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = await this.appService.login(body);
      req.session['user'] = user;
      return res.redirect('/');
    } catch (error) {
      return res.render('auth/login', {
        user: null,
        title: 'Вход',
        error: error.message,
        form: {
          email: body.email,
        },
      });
    }
  }

  @Get('register')
  getRegister(@Req() req: Request, @Res() res: Response) {
    if (req.session['user']) {
      return res.redirect('/');
    }

    return res.render('auth/register', {
      user: null,
      title: 'Регистрация',
    });
  }

  @Post('register')
  async register(
    @Body() body: { email: string; name: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = await this.appService.register(body);
      req.session['user'] = user;
      return res.redirect('/');
    } catch (error) {
      return res.render('auth/register', {
        user: null,
        title: 'Регистрация',
        error: error.message,
        form: {
          email: body.email,
          name: body.name,
        },
      });
    }
  }

  @Get('change-password')
  getChangePassword(@Req() req: Request, @Res() res: Response) {
    if (!req.session['user']) {
      return res.redirect('/login');
    }

    return res.render('auth/change-password', {
      user: req.session['user'],
      title: 'Смена пароля',
    });
  }

  @Post('change-password')
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!req.session['user']) {
      return res.redirect('/login');
    }

    if (body.newPassword !== body.confirmPassword) {
      return res.render('auth/change-password', {
        user: req.session['user'],
        title: 'Смена пароля',
        error: 'Новый пароль и подтверждение не совпадают',
      });
    }

    try {
      await this.appService.changePassword(
        req.session['user'].id,
        body.currentPassword,
        body.newPassword,
      );

      return res.render('auth/change-password', {
        user: req.session['user'],
        title: 'Смена пароля',
        success: 'Пароль успешно обновлён',
      });
    } catch (error) {
      return res.render('auth/change-password', {
        user: req.session['user'],
        title: 'Смена пароля',
        error: error.message,
      });
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }

  @Get('about')
  @Render('about')
  getAbout(@Req() req) {
    return { user: req.session['user'] || null, isAbout: true };
  }

  @Get('feedback')
  @Render('feedback')
  getFeedback(@Req() req) {
    return { user: req.session['user'] || null };
  }
}
