import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUsertDto {
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
    description: 'senha do usuario',
    example: 'abc123',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
