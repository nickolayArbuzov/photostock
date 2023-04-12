import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import RequestWithUser from '../../types/interfaces/request-with-user.interface';
import { BearerAuthGuard } from '../../auth/api/guards/strategies/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateProfileInputModel,
  UpdateProfileInputModel,
} from '../types/user-profile-input.models';
import { CheckUserNameInterceptor } from './interceptor/check-user-name.interceptor';
import { CreateProfileCommand } from '../application/use-cases/create-profile.use-case';
import { UpdateProfileCommand } from '../application/use-cases/update-profile.use-case';
import { DeleteProfileCommand } from '../application/use-cases/delete-profile.use-case';
import { ProfileUserViewModel } from '../types/user-profile-view.models';
import { GetProfileUserCommand } from '../application/queries/handlers/get-profile-for-user.handler';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The profile get for current user.',
    type: ProfileUserViewModel,
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @UseGuards(BearerAuthGuard)
  @Get('profile')
  async getProfileForCurrentUser(@Req() req: RequestWithUser) {
    const result = await this.queryBus.execute<
      GetProfileUserCommand,
      Promise<ProfileUserViewModel>
    >(new GetProfileUserCommand(req.user.userId));
    if (!result) throw new NotFoundException();
    return result;
  }

  @ApiBearerAuth()
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
  @UseInterceptors(CheckUserNameInterceptor)
  @UseInterceptors(FileInterceptor('avatar', {}))
  @Post('profile')
  async createProfileForCurrentUser(
    @Req() req: RequestWithUser,
    @Body() createProfileInputModel: CreateProfileInputModel,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 10000 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.commandBus.execute(
      new CreateProfileCommand(req.user.userId, file, createProfileInputModel),
    );
    return;
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The profile has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'The profile for update is not exists.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(CheckUserNameInterceptor)
  @UseInterceptors(FileInterceptor('avatar', {}))
  @Put('profile')
  async updateProfileForCurrentUser(
    @Req() req: RequestWithUser,
    @Body() updateProfileInputModel: UpdateProfileInputModel,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1000 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.commandBus.execute(
      new UpdateProfileCommand(req.user.userId, file, updateProfileInputModel),
    );
    return;
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The profile has been successfully deleted.',
  })
  @ApiResponse({
    status: 400,
    description: 'The profile for update is not exists.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @Delete('profile')
  async deleteProfileForCurrentUser(@Req() req: RequestWithUser) {
    await this.commandBus.execute(new DeleteProfileCommand(req.user.userId));
    return;
  }
}
