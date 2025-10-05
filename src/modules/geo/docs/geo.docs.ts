import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const GetGeoAreaDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obter métricas de floração' }),
    ApiResponse({
      status: 200,
      description: 'Metricas retornadas com sucesso',
    }),
    ApiQuery({
      description: 'Longitude Mínima',
      name: 'minLon',
      type: Number,
      required: true,
    }),
    ApiQuery({
      description: 'Latitude Mínima',
      name: 'minLat',
      type: Number,
      required: true,
    }),
    ApiQuery({
      description: 'Longitude Máxima',
      name: 'maxLon',
      type: Number,
      required: true,
    }),
    ApiQuery({
      description: 'Latitude Mínima',
      name: 'maxLat',
      type: Number,
      required: true,
    }),
  );

export const GetGeoPointDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obter métricas de floração' }),
    ApiResponse({
      status: 200,
      description: 'Metricas retornadas com sucesso',
    }),
    ApiQuery({
      description: 'Longitude',
      name: 'lon',
      type: Number,
      required: true,
    }),
    ApiQuery({
      description: 'Latitude',
      name: 'lat',
      type: Number,
      required: true,
    }),
  );
