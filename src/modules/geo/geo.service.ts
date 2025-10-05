import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BoundingBox } from './types/raw-boundingBox';
import { LocationInfo } from './types/raw-location-info';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  validateBrazilianCoordinates(bbox: BoundingBox): boolean {
    const { minLat, minLon, maxLat, maxLon } = bbox;

    const isValidLat = minLat >= -33.75 && maxLat <= 5.27;
    const isValidLon = minLon >= -73.98 && maxLon <= -34.79;

    if (!isValidLat || !isValidLon) {
      this.logger.warn(
        `Coordinates outside Brazil: lat [${minLat}, ${maxLat}], lon [${minLon}, ${maxLon}]`,
      );
      return false;
    }

    return true;
  }

  validateBoundingBox(bbox: BoundingBox): boolean {
    const { minLat, minLon, maxLat, maxLon } = bbox;

    if (minLat >= maxLat || minLon >= maxLon) {
      this.logger.error(
        `Bounding box inválido: minLat (${minLat}) deve ser < maxLat (${maxLat}), minLon (${minLon}) deve ser < maxLon (${maxLon})`,
      );
      return false;
    }

    if (minLat < -90 || maxLat > 90 || minLon < -180 || maxLon > 180) {
      this.logger.error(
        `Coordenadas fora do intervalo válido: lat [-90, 90], lon [-180, 180]`,
      );
      return false;
    }

    return true;
  }

  async getReverseGeocodingInfo(
    lat: number,
    lon: number,
  ): Promise<LocationInfo | null> {
    const cacheKey = `reverse_geo_${lat.toFixed(4)}_${lon.toFixed(4)}`;
    const cached = await this.cacheManager.get<LocationInfo>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response: any = await firstValueFrom(
        this.httpService.get('https://nominatim.openstreetmap.org/reverse', {
          params: {
            lat,
            lon,
            format: 'json',
            addressdetails: 1,
          },
          headers: {
            'User-Agent': 'BloomMonitor/1.0 (hackathon@example.com)',
          },
          timeout: 5000,
        }),
      );

      if (!response.data) {
        return null;
      }

      const { address, display_name } = response.data;
      const locationInfo: LocationInfo = {
        city: address?.city || address?.town || address?.village,
        state: address?.state,
        country: address?.country,
        displayName: display_name,
      };

      await this.cacheManager.set(cacheKey, locationInfo, 2592000);

      return locationInfo;
    } catch (error) {
      this.logger.error(
        `Error when performing reverse geocoding for (${lat}, ${lon})`,
        error.message,
      );
      return null;
    }
  }

  calculateCenter(bbox: BoundingBox): { lat: number; lon: number } {
    return {
      lat: (bbox.minLat + bbox.maxLat) / 2,
      lon: (bbox.minLon + bbox.maxLon) / 2,
    };
  }

  calculateArea(bbox: BoundingBox): number {
    const { minLat, minLon, maxLat, maxLon } = bbox;

    const latDiff = (maxLat - minLat) * 111;
    const lonDiff =
      (maxLon - minLon) *
      111 *
      Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));

    return Math.abs(latDiff * lonDiff);
  }
}
