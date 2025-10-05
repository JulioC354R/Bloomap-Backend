import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class QueryGeoAreaDto {
  @Type(() => Number)
  @IsNotEmpty()
  minLon: number;

  @Type(() => Number)
  @IsNotEmpty()
  minLat: number;

  @Type(() => Number)
  @IsNotEmpty()
  maxLon: number;

  @Type(() => Number)
  @IsNotEmpty()
  maxLat: number;
}
