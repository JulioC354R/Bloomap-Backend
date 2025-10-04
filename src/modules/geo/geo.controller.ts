import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { LocationService, BoundingBox } from './geo.service';
import { CompleteBloomService } from './bloom.service';

@Controller('api/bloom')
export class BloomController {
  private readonly logger = new Logger(BloomController.name);

  constructor(
    private locationService: LocationService,
    private bloomService: CompleteBloomService,
  ) {}

  @Get('area')
  async getBloomByArea(
    @Query('minLat') minLat: string,
    @Query('minLon') minLon: string,
    @Query('maxLat') maxLat: string,
    @Query('maxLon') maxLon: string,
  ): Promise<any> {
    if (!minLat || !minLon || !maxLat || !maxLon) {
      throw new BadRequestException({
        message:
          'Todos os parâmetros são obrigatórios: minLat, minLon, maxLat, maxLon',
        example:
          '/api/bloom/area?minLat=-30.5&minLon=-51.5&maxLat=-29.5&maxLon=-50.5',
      });
    }

    try {
      const bbox: BoundingBox = {
        minLat: parseFloat(minLat),
        minLon: parseFloat(minLon),
        maxLat: parseFloat(maxLat),
        maxLon: parseFloat(maxLon),
      };

      if (
        isNaN(bbox.minLat) ||
        isNaN(bbox.minLon) ||
        isNaN(bbox.maxLat) ||
        isNaN(bbox.maxLon)
      ) {
        throw new BadRequestException('All coordinates must be valid numbers');
      }

      if (!this.locationService.validateBoundingBox(bbox)) {
        throw new BadRequestException(
          'Invalid bounding box. Verify that minLat < maxLat and minLon < maxLon',
        );
      }

      if (!this.locationService.validateBrazilianCoordinates(bbox)) {
        throw new BadRequestException('The selected area is outside Brazil');
      }

      const center = this.locationService.calculateCenter(bbox);

      const area = this.locationService.calculateArea(bbox);
      this.logger.log(
        `Searching for flowering data for an area of ${area.toFixed(2)} km² centered at (${center.lat.toFixed(4)}, ${center.lon.toFixed(4)})`,
      );

      const locationInfo = await this.locationService.getReverseGeocodingInfo(
        center.lat,
        center.lon,
      );
      if (locationInfo?.displayName) {
        this.logger.log(`Region: ${locationInfo.displayName}`);
      }

      const bloomData = await this.bloomService.getBloomDataFromLocation(bbox);

      return {
        bbox,
        center,
        area: `${area.toFixed(2)} km²`,
        locationInfo,
        ...bloomData,
      };
    } catch (error) {
      this.logger.error('Error processing request', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Error retrieving flowering data', 500);
    }
  }

  @Get('point')
  async getBloomByPoint(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Promise<any> {
    if (!lat || !lon) {
      throw new BadRequestException({
        message: 'The “lat” and “lon” parameters are mandatory.',
        example: '/api/bloom/point?lat=-30.034&lon=-51.217',
      });
    }

    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new BadRequestException('Coordinates must be valid numbers');
      }

      const bbox: BoundingBox = {
        minLat: latitude - 0.1,
        minLon: longitude - 0.1,
        maxLat: latitude + 0.1,
        maxLon: longitude + 0.1,
      };

      if (!this.locationService.validateBrazilianCoordinates(bbox)) {
        throw new BadRequestException('Location outside Brazil');
      }

      this.logger.log(
        `Searching for flowering data for point (${latitude}, ${longitude})`,
      );

      const locationInfo = await this.locationService.getReverseGeocodingInfo(
        latitude,
        longitude,
      );
      if (locationInfo?.displayName) {
        this.logger.log(`Region: ${locationInfo.displayName}`);
      }

      const bloomData = await this.bloomService.getBloomDataFromLocation(bbox);

      return {
        point: { lat: latitude, lon: longitude },
        locationInfo,
        ...bloomData,
      };
    } catch (error) {
      this.logger.error('Error processing request', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Error retrieving flowering data', 500);
    }
  }
}
