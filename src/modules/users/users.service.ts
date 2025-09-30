import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@users/users.repository';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUsertDto } from '@users/dto/update-user.dto';
import { OrderByEnum } from 'src/common/enums/orderBy.enum';
import { RawUsersList } from '@users/types/raw-users-list';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: CreateUserDto) {
    return await this.userRepository.create(data);
  }

  async findAll(query?: {
    orderBy?: {
      field: (typeof OrderByEnum.USERS)[number];
      direction: 'asc' | 'desc';
    };
    page?: number;
    limit?: number;
  }): Promise<{
    data: RawUsersList[];
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const skip = (page - 1) * limit;

    const { data, total } = await this.userRepository.findAll({
      orderBy: query.orderBy,
      take: limit,
      skip,
    });

    return {
      data,
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async update(id: string, data: UpdateUsertDto) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('user not found');
    return await this.userRepository.update(id, data);
  }

  async delete(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('user not found');
    return await this.userRepository.delete(id);
  }
}
