import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import RequestWithUser from '../../types/interfaces/request-with-user.interface';
import { Response } from 'express';
import { BearerAuthGuard } from '../../auth/api/guards/bearer-auth.guard';

@ApiTags('user')
@Controller('user')
export class AuthController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'The profile get for current user.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @UseGuards(BearerAuthGuard)
  @Get('profile')
  async getProfileforCurrentUser(@Req() req: RequestWithUser) {
    return;
  }

  @ApiResponse({
    status: 204,
    description: 'The profile has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @Post('profile')
  async createProfileForCurrentUser(@Req() req: RequestWithUser) {
    return;
  }

  @ApiResponse({
    status: 204,
    description: 'The profile has been successfully updated.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @Put('profile')
  async updateProfileForCurrentUser(@Req() req: RequestWithUser) {
    return
  }

  @ApiResponse({
    status: 204,
    description: 'The profile has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @Delete('profile')
  async deleteProfileForCurrentUser(@Req() req: RequestWithUser) {
    return 
  }
}