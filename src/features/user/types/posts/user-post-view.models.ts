import { ApiProperty } from '@nestjs/swagger';

export class PostUserViewModel {
  @ApiProperty()
  id: number;
  @ApiProperty()
  description: string;
  @ApiProperty()
  postPhotos: string[];
}

export class PostsUserWithPaginationViewModel {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  posts: PostUserViewModel[];
}