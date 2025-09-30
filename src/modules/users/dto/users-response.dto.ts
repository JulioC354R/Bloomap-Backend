import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    description: 'nome do usuario',
    example: 'John Doe',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'email do usuario',
    example: 'john@mail.com.br',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'data de criação de registro do usuario',
    example: new Date('2025-07-09 20:00:00'),
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'data de atualização de registro do usuario',
    example: new Date('2025-07-09 20:00:00'),
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
