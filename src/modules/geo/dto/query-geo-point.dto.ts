import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class QueryGeoPointDto {
  @Type(() => Number)
  @IsNotEmpty()
  lon: number;

  @Type(() => Number)
  @IsNotEmpty()
  lat: number;
}
