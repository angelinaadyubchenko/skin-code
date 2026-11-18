import { Controller, Get, Post, Body, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll(@Req() req, @Res() res) {
    const reviews = await this.reviewsService.findAll();
    const sessionUser = req.session['user'] || null;
    const hasReview = sessionUser ? await this.reviewsService.hasReview(sessionUser.id) : false;
    return res.render('reviews/index', {
      reviews,
      isReviews: true,
      user: sessionUser,
      hasReview,
    });
  }

  @Get('add')
  async addPage(
    @Query('orderId') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!req.session['user']) {
      return res.redirect('/login');
    }

    if (orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (!order) {
        return res.redirect('/orders');
      }

      return res.render('reviews/add', {
        isReviews: true,
        user: req.session['user'] || null,
        order,
      });
    }

    const users = await this.prisma.user.findMany();
    const products = await this.prisma.product.findMany();

    return res.render('reviews/add', {
      isReviews: true,
      user: req.session['user'] || null,
      users,
      products,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    const review = await this.reviewsService.findOne(id);
    return res.render('reviews/show', {
      review,
      isReviews: true,
      user: req.session['user'] || null,
    });
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req, @Res() res) {
    const review = await this.reviewsService.findOne(id);
    const users = await this.prisma.user.findMany();
    const products = await this.prisma.product.findMany();

    return res.render('reviews/edit', {
      review,
      isReviews: true,
      user: req.session['user'] || null,
      users,
      products,
    });
  }

  @Post()
  async create(
    @Body() dto: CreateReviewDto & { orderId?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.reviewsService.create(dto);
    } catch {
      const reviews = await this.reviewsService.findAll();
      return res.render('reviews/index', {
        reviews,
        isReviews: true,
        user: req.session['user'] || null,
        hasReview: true,
        error: 'Вы уже оставили отзыв',
      });
    }

    if (dto.orderId) {
      return res.redirect(`/reviews/add?orderId=${dto.orderId}`);
    }

    return res.redirect('/reviews');
  }

  @Post(':id/edit')
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Res() res) {
    await this.reviewsService.update(id, dto);
    return res.redirect(`/reviews/${id}`);
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string, @Res() res) {
    await this.reviewsService.remove(id);
    return res.redirect('/reviews');
  }
}
