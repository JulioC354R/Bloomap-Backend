import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { LocationGeocodingService } from './geo.service';
import { CompleteBloomService } from './bloom.service';

@Controller('api/bloom')
export class BloomController {
  private readonly logger = new Logger(LocationGeocodingService.name);

  constructor(
    private locationService: LocationGeocodingService,
    private bloomService: CompleteBloomService,
  ) {}

  /**
   * GET /api/bloom/location
   * Query params: city, state, country (opcional)
   */
  @Get('location')
  async getBloomByLocation(
    @Query('city') city: string,
    @Query('state') state: string,
    @Query('country') country: string = 'Brasil',
  ): Promise<any> {
    // Validar inputs
    if (!city || !state) {
      throw new BadRequestException({
        message: 'Parâmetros "city" e "state" são obrigatórios',
        example:
          '/api/bloom/location?city=Porto%20Alegre&state=Rio%20Grande%20do%20Sul',
      });
    }

    try {
      // 1. Geocodificar
      const location = await this.locationService.getLocationCoordinates(
        city,
        state,
        country,
      );

      // 2. Validar se está no Brasil
      if (
        !this.locationService.validateBrazilianCoordinates(
          location.lat,
          location.lon,
        )
      ) {
        throw new BadRequestException('Localização fora do Brasil');
      }

      // 3. Buscar dados de floração

      const bloomData = await this.bloomService.getBloomDataFromLocation(
        location.lat,
        location.lon,
      );

      return bloomData;
    } catch (error) {
      this.logger.error('Erro ao processar requisição', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Erro ao buscar dados de floração', 500);
    }
  }

  /**
   * GET /api/bloom/states
   * Retorna lista de estados disponíveis
   */
  @Get('states')
  getAvailableStates() {
    return {
      states: [
        { code: 'RS', name: 'Rio Grande do Sul' },
        { code: 'SP', name: 'São Paulo' },
        { code: 'RJ', name: 'Rio de Janeiro' },
        { code: 'MG', name: 'Minas Gerais' },
        { code: 'PR', name: 'Paraná' },
        { code: 'SC', name: 'Santa Catarina' },
        // ... outros estados
      ],
    };
  }
}
