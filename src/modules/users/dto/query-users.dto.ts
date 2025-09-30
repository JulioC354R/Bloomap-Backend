import { IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderByEnum } from 'src/common/enums/orderBy.enum';

export class QueryListUserDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsIn(OrderByEnum.USERS)
  field?: (typeof OrderByEnum.USERS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc' = 'desc';
}
