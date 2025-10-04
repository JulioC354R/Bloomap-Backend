import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUsertDto } from '@users/dto/update-user.dto';
import { RawUsersList } from '@users/types/raw-users-list';
import { OrderByEnum } from 'src/common/enums/orderBy.enum';
import { buildOrderBy } from '@users/helpers/build-orderBy';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return await this.prisma.user.create({ data });
  }

  async findAll(query?: {
    orderBy?: {
      field?: (typeof OrderByEnum.USERS)[number];
      direction?: 'asc' | 'desc';
    };
    skip?: number;
    take?: number;
  }): Promise<{
    data: RawUsersList[];
    total: number;
  }> {
    const orderBy = buildOrderBy(query.orderBy);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: query.skip,
        take: query.take,
        orderBy,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      total,
    };
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUsertDto) {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
