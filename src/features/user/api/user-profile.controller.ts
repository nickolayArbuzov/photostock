import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import RequestWithUser from '../../types/interfaces/request-with-user.interface';
import { BearerAuthGuard } from '../../auth/api/guards/strategies/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileInputModel } from '../types/profile/user-profile-input.models';
import { CheckUserNameInterceptor } from './interceptor/check-user-name.interceptor';
import { UpdateProfileCommand } from '../application/use-cases/profile/update-profile.use-case';
import { ProfileUserViewModel } from '../types/profile/user-profile-view.models';
import { GetProfileUserCommand } from '../application/queries/handlers/profile/get-profile-for-user.handler';
import {
  CreatePostInputModel,
  UpdatePostInputModel,
} from '../types/posts/user-post-input.models';
import { CreatePostCommand } from '../application/use-cases/posts/create-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/posts/update-post.use-case';
import { DeletePostCommand } from '../application/use-cases/posts/delete-post.use-case';
import { FindPostByIdCommand } from '../application/queries/handlers/posts/find-post-by-id.handler';
import { PostUserViewModel } from '../types/posts/user-post-view.models';
import { IntTransformPipe } from '../../../helpers/common/pipes/int-transform.pipe';

@ApiTags('user')
@Controller('user')
export class UserProfileController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The profile get for current user-profile.',
    type: ProfileUserViewModel,
  })
  @ApiResponse({
    status: 401,
    description: 'The user-profile not identified.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile for current user-profile doesnt exists.',
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
    description: 'The profile has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'The profile for update is not exists.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user-profile not identified.',
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

  @ApiResponse({
    status: 200,
    description: 'The post get by id.',
    type: ProfileUserViewModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Post doesnt exists.',
  })
  @Get('post/:id')
  async getPostById(@Param('id', new IntTransformPipe()) id: number) {
    const post = await this.queryBus.execute<
      FindPostByIdCommand,
      Promise<PostUserViewModel>
    >(new FindPostByIdCommand(id));
    if (!post) throw new NotFoundException();
    return post;
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @ApiConsumes('multipart/from-data')
  @HttpCode(201)
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(FileInterceptor('postPhoto', {}))
  @Post('post')
  async createPostForCurrentUser(
    @Req() req: RequestWithUser,
    @Body() createPostInputModel: CreatePostInputModel,
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
    const postId = await this.commandBus.execute<
      CreatePostCommand,
      Promise<number>
    >(new CreatePostCommand(req.user.userId, file, createPostInputModel));
    return await this.queryBus.execute<
      FindPostByIdCommand,
      Promise<PostUserViewModel>
    >(new FindPostByIdCommand(postId));
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @ApiResponse({
    status: 404,
    description: 'The post for update did not found.',
  })
  @ApiConsumes('multipart/from-data')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(FileInterceptor('postPhoto', {}))
  @Put('post/:id')
  async updatePostForCurrentUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updatePostInputModel: UpdatePostInputModel,
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
      new UpdatePostCommand(req.user.userId, +id, file, updatePostInputModel),
    );
    return;
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'The user not identified.',
  })
  @ApiResponse({
    status: 404,
    description: 'The post for delete did not found.',
  })
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @Delete('post/:id')
  async deletePostForCurrentUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    await this.commandBus.execute(new DeletePostCommand(req.user.userId, +id));
    return;
  }
}