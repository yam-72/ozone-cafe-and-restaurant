import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { CartsService } from './carts.service';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest
  extends Request {
  user: {
    id: number;
  };
}

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
  ) {}

  @Get()
  getCart(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cartsService.getCart(
      req.user.id,
    );
  }

  @Post('items')
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() data: AddCartItemDto,
  ) {
    return this.cartsService.addItem(
      req.user.id,
      data,
    );
  }

  @Patch('items/:id')
  updateItem(
    @Req() req: AuthenticatedRequest,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    data: UpdateCartItemDto,
  ) {
    return this.cartsService.updateItem(
      req.user.id,
      id,
      data,
    );
  }

  @Delete('items/:id')
  removeItem(
    @Req() req: AuthenticatedRequest,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.cartsService.removeItem(
      req.user.id,
      id,
    );
  }

  @Delete()
  clearCart(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.cartsService.clearCart(
      req.user.id,
    );
  }
}
