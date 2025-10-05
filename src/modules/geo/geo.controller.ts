import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { LocationService } from './geo.service';
import { BloomService } from './bloom.service';
import { BoundingBox } from './types/raw-boundingBox';
import { QueryGeoAreaDto } from './dto/query-geo-area.dto';
import { GetGeoAreaDocs, GetGeoPointDocs } from './docs/geo.docs';
import { QueryGeoPointDto } from './dto/query-geo-point.dto';

@Controller('api/bloom')
export class GeoController {
  private readonly logger = new Logger(GeoController.name);

  constructor(
    private locationService: LocationService,
    private bloomService: BloomService,
  ) {}

  @GetGeoAreaDocs()
  @Get('area')
  async getBloomByArea(@Query() query: QueryGeoAreaDto): Promise<any> {
    const { minLat, minLon, maxLat, maxLon } = query;

    try {
      const bbox: BoundingBox = {
        minLat: minLat,
        minLon: minLon,
        maxLat: maxLat,
        maxLon: maxLon,
      };

      const isValidateBoundingBox =
        this.locationService.validateBoundingBox(bbox);
      if (!isValidateBoundingBox) {
        throw new BadRequestException(
          'Invalid bounding box. Verify that minLat < maxLat and minLon < maxLon',
        );
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

  @GetGeoPointDocs()
  @Get('point')
  async getBloomByPoint(@Query() query: QueryGeoPointDto): Promise<any> {
    const { lat, lon } = query;

    try {
      const bbox: BoundingBox = {
        minLat: lat - 0.1,
        minLon: lon - 0.1,
        maxLat: lat + 0.1,
        maxLon: lon + 0.1,
      };

      this.logger.log(
        `Searching for flowering data for point (${lat}, ${lon})`,
      );

      const locationInfo = await this.locationService.getReverseGeocodingInfo(
        lat,
        lon,
      );

      const bloomData = await this.bloomService.getBloomDataFromLocation(bbox);

      return {
        point: { lat: lat, lon: lon },
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
