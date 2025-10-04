import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { UserResponseDto } from '@users/dto/users-response.dto';
import { Type } from 'class-transformer';

export class ListUserDto {
  @ApiProperty({
    description: 'dados do usuario',
    type: UserResponseDto,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => UserResponseDto)
  @ValidateNested({ each: true })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'número da pagina',
    example: 7.5,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'tamanho da pagina',
    example: 7.5,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'número total de items',
    example: 7.5,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  totalCount: number;

  @ApiProperty({
    description: 'número total de paginas',
    example: 10,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  totalPages: number;
}
