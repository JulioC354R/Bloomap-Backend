import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUsertDto } from '@users/dto/update-user.dto';
import { ListUserDto } from '@users/dto/list-users.dto';
import { UserResponseDto } from '@users/dto/users-response.dto';
import { OrderByDirection, OrderByEnum } from 'src/common/enums/orderBy.enum';

export const CreateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Criar um novo usuario' }),
    ApiResponse({
      status: 201,
      description: 'Usuario criado com sucesso',
      type: CreateUserDto,
    }),
  );

export const GetAllUsersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar todos os usuarios' }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuarios',
      type: ListUserDto,
    }),
    ApiQuery({
      description: 'ordenação do usuario',
      name: 'field',
      enum: OrderByEnum.USERS,
      required: false,
    }),
    ApiQuery({
      description: 'ordenação do usuario',
      name: 'direction',
      enum: OrderByDirection,
      required: false,
    }),
    ApiQuery({
      description: 'número da pagina',
      name: 'page',
      example: 1,
      type: Number,
      required: false,
    }),
    ApiQuery({
      description: 'tamano da pagina',
      name: 'limit',
      example: 10,
      type: Number,
      required: false,
    }),
  );

export const GetUserByIdDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Buscar um usuario por ID' }),
    ApiResponse({
      status: 200,
      description: 'Usuario encontrado',
      type: UserResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Usuario não encontrado' }),
  );

export const UpdateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Atualizar um usuario existente' }),
    ApiResponse({
      status: 200,
      description: 'Usuario atualizado com sucesso',
      type: UpdateUsertDto,
    }),
    ApiResponse({ status: 404, description: 'Usuario não encontrado' }),
  );

export const DeleteUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Excluir um usuario por ID' }),
    ApiResponse({ status: 200, description: 'Usuario excluído com sucesso' }),
    ApiResponse({ status: 404, description: 'Usuario não encontrado' }),
  );
