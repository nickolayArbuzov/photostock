import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FilesService } from '../../../../adapters/files/files.service';
import { Inject } from '@nestjs/common';
import { v4 } from 'uuid';
import { CreatePostInputModel } from '../../types/user-post-input.models';
import {
  IPostsUserRepo,
  POSTS_USER_REPO,
} from '../../types/interfaces/i-posts-user.repo';
import { PostDomain } from '../../../../core/domain/post.domain';

export class CreatePostCommand {
  constructor(
    public readonly userId: number,
    public readonly file: Express.Multer.File,
    public readonly createPostInputModel: CreatePostInputModel,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private filesService: FilesService,
    @Inject(POSTS_USER_REPO) private postsRepository: IPostsUserRepo,
  ) {}

  async execute(command: CreatePostCommand): Promise<void> {
    const { description } = command.createPostInputModel;

    let link;
    if (command.file) {
      const filePath = `content/user/${command.userId}/posts/${v4()}.${
        command.file.mimetype.split('/')[1]
      }`;
      link = await this.filesService.saveFile(filePath, command.file);
    }
    const userId = command.userId;
    const post = new PostDomain({ description, link, userId });
    await this.postsRepository.create(post);
  }
}
