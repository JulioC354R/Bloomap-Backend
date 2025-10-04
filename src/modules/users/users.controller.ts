import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UserService } from '@users/users.service';
import { UpdateUsertDto } from '@users/dto/update-user.dto';
import { QueryListUserDto } from '@users/dto/query-users.dto';
import { UserResponseDto } from '@users/dto/users-response.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateUserDocs,
  DeleteUserDocs,
  GetAllUsersDocs,
  GetUserByIdDocs,
  UpdateUserDocs,
} from '@users/docs/users.docs';
import { ListUserDto } from '@users/dto/list-users.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @CreateUserDocs()
  @Post()
  async create(@Body() body: CreateUserDto): Promise<void> {
    await this.userService.create(body);
  }

  @GetAllUsersDocs()
  @Get()
  async findAll(@Query() query: QueryListUserDto): Promise<ListUserDto> {
    const { page, limit, field, direction } = query;

    return await this.userService.findAll({
      page,
      limit,
      orderBy: {
        field,
        direction,
      },
    });
  }

  @GetUserByIdDocs()
  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findById(id);
  }

  @UpdateUserDocs()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUsertDto,
  ): Promise<UserResponseDto> {
    return await this.userService.update(id, body);
  }

  @DeleteUserDocs()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
