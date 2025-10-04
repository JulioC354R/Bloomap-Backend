import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

interface GeocodeResult {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  bbox?: [number, number, number, number]; // [west, south, east, north]
  displayName?: string;
}

@Injectable()
export class LocationGeocodingService {
  private readonly logger = new Logger(LocationGeocodingService.name);

  // Coordenadas pré-configuradas das principais cidades brasileiras
  private readonly PRESET_LOCATIONS: Record<
    string,
    { lat: number; lon: number }
  > = {
    // Rio Grande do Sul
    'Porto Alegre-RS': { lat: -30.0346, lon: -51.2177 },
    'Caxias do Sul-RS': { lat: -29.1634, lon: -51.1797 },
    'Pelotas-RS': { lat: -31.7654, lon: -52.3376 },
    'Santa Maria-RS': { lat: -29.6842, lon: -53.8069 },
    'Passo Fundo-RS': { lat: -28.262, lon: -52.4083 },
    'Canoas-RS': { lat: -29.9177, lon: -51.1844 },
    'Novo Hamburgo-RS': { lat: -29.6783, lon: -51.1306 },

    // São Paulo
    'São Paulo-SP': { lat: -23.5505, lon: -46.6333 },
    'Campinas-SP': { lat: -22.9056, lon: -47.0608 },
    'Santos-SP': { lat: -23.9608, lon: -46.3336 },
    'Ribeirão Preto-SP': { lat: -21.1704, lon: -47.8103 },

    // Rio de Janeiro
    'Rio de Janeiro-RJ': { lat: -22.9068, lon: -43.1729 },
    'Niterói-RJ': { lat: -22.8833, lon: -43.1036 },

    // Minas Gerais
    'Belo Horizonte-MG': { lat: -19.9167, lon: -43.9345 },
    'Uberlândia-MG': { lat: -18.9186, lon: -48.2772 },

    // Paraná
    'Curitiba-PR': { lat: -25.4284, lon: -49.2733 },
    'Londrina-PR': { lat: -23.3045, lon: -51.1696 },
    'Maringá-PR': { lat: -23.4205, lon: -51.9331 },

    // Santa Catarina
    'Florianópolis-SC': { lat: -27.5954, lon: -48.548 },
    'Joinville-SC': { lat: -26.3045, lon: -48.8487 },
    'Blumenau-SC': { lat: -26.9194, lon: -49.0661 },

    // Bahia
    'Salvador-BA': { lat: -12.9714, lon: -38.5014 },
    'Feira de Santana-BA': { lat: -12.2664, lon: -38.9663 },

    // Pernambuco
    'Recife-PE': { lat: -8.0476, lon: -34.877 },

    // Ceará
    'Fortaleza-CE': { lat: -3.7319, lon: -38.5267 },

    // Brasília
    'Brasília-DF': { lat: -15.8267, lon: -47.9218 },
  };

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * MÉTODO 1: Tentar cache/preset primeiro (RÁPIDO)
   */
  async getLocationCoordinates(
    city: string,
    state: string,
    country: string = 'Brasil',
  ): Promise<GeocodeResult> {
    // Normalizar entrada
    const normalizedCity = this.normalizeString(city);
    const normalizedState = this.normalizeString(state);

    // Tentar sigla do estado (ex: "RS" ou "Rio Grande do Sul")
    const stateCode = this.getStateCode(normalizedState);

    // 1. TENTAR PRESET (mais rápido)
    const presetKey = `${normalizedCity}-${stateCode}`;
    const preset = this.PRESET_LOCATIONS[presetKey];

    if (preset) {
      this.logger.log(`Usando coordenadas preset para ${city}, ${state}`);
      return {
        city,
        state,
        country,
        ...preset,
      };
    }

    // 2. TENTAR CACHE
    const cacheKey = `geo_${normalizedCity}_${stateCode}_${country}`;
    const cached = await this.cacheManager.get<GeocodeResult>(cacheKey);

    if (cached) {
      this.logger.log(`Usando coordenadas do cache para ${city}, ${state}`);
      return cached;
    }

    // 3. CHAMAR API DE GEOCODING (Nominatim OSM)
    const result = await this.geocodeWithNominatim(city, state, country);

    // Cachear por 30 dias
    await this.cacheManager.set(cacheKey, result, 2592000);

    return result;
  }

  /**
   * MÉTODO 2: Geocoding via Nominatim (OpenStreetMap)
   */
  private async geocodeWithNominatim(
    city: string,
    state: string,
    country: string,
  ): Promise<GeocodeResult> {
    const query = `${city}, ${state}, ${country}`;

    this.logger.log(`Geocodificando: ${query}`);

    try {
      const response: any = await firstValueFrom(
        this.httpService.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            limit: 1,
            addressdetails: 1,
            countrycodes: 'br', // Apenas Brasil
          },
          headers: {
            'User-Agent': 'BloomMonitor/1.0 (hackathon@example.com)',
          },
          timeout: 5000,
        }),
      );

      if (!response.data || response.data.length === 0) {
        throw new HttpException(`Localização não encontrada: ${query}`, 404);
      }

      const result = response.data[0];
      return result;
      //   return {
      //     city,
      //     state,
      //     country,
      //     lat: parseFloat(result.lat),
      //     lon: parseFloat(result.lon),
      //     bbox: result.boundingbox
      //       ? [
      //           parseFloat(result.boundingbox[2]), // west
      //           parseFloat(result.boundingbox[0]), // south
      //           parseFloat(result.boundingbox[3]), // east
      //           parseFloat(result.boundingbox[1]), // north
      //         ]
      //       : undefined,
      //     displayName: result.display_name,
      //   };
    } catch (error) {
      this.logger.error(`Erro ao geocodificar ${query}`, error.message);

      // FALLBACK: Usar coordenadas do centro do estado
      const stateFallback = this.getStateFallback(state);
      if (stateFallback) {
        this.logger.warn(`Usando fallback para ${state}`);
        return {
          city,
          state,
          country,
          ...stateFallback,
        };
      }

      throw new HttpException('Erro ao buscar coordenadas da localização', 500);
    }
  }

  /**
   * MÉTODO 3: Fallback - coordenadas do centro de cada estado
   */
  private getStateFallback(state: string): { lat: number; lon: number } | null {
    const stateCenters: Record<string, { lat: number; lon: number }> = {
      AC: { lat: -9.0238, lon: -70.812 },
      AL: { lat: -9.5713, lon: -36.782 },
      AP: { lat: 0.902, lon: -52.003 },
      AM: { lat: -3.4168, lon: -65.8561 },
      BA: { lat: -12.5797, lon: -41.7007 },
      CE: { lat: -5.4984, lon: -39.3206 },
      DF: { lat: -15.7998, lon: -47.8645 },
      ES: { lat: -19.1834, lon: -40.3089 },
      GO: { lat: -15.827, lon: -49.8362 },
      MA: { lat: -4.9609, lon: -45.2744 },
      MT: { lat: -12.6819, lon: -56.9211 },
      MS: { lat: -20.7722, lon: -54.7852 },
      MG: { lat: -18.5122, lon: -44.555 },
      PA: { lat: -1.9981, lon: -54.9306 },
      PB: { lat: -7.2399, lon: -36.782 },
      PR: { lat: -24.897, lon: -51.0275 },
      PE: { lat: -8.8137, lon: -36.9541 },
      PI: { lat: -7.7183, lon: -42.7289 },
      RJ: { lat: -22.2876, lon: -42.7151 },
      RN: { lat: -5.4026, lon: -36.9541 },
      RS: { lat: -30.0346, lon: -51.2177 },
      RO: { lat: -10.9471, lon: -62.8237 },
      RR: { lat: 2.7376, lon: -62.0751 },
      SC: { lat: -27.2423, lon: -50.2189 },
      SP: { lat: -22.1987, lon: -48.6889 },
      SE: { lat: -10.5741, lon: -37.3857 },
      TO: { lat: -10.1753, lon: -48.2982 },
    };

    const stateCode = this.getStateCode(state);
    return stateCenters[stateCode] || null;
  }

  /**
   * Converter nome completo do estado para sigla
   */
  private getStateCode(stateName: string): string {
    const normalized = this.normalizeString(stateName);

    // Se já é sigla (2 letras)
    if (normalized.length === 2) {
      return normalized.toUpperCase();
    }

    // Mapear nome completo para sigla
    const stateMap: Record<string, string> = {
      acre: 'AC',
      alagoas: 'AL',
      amapa: 'AP',
      amazonas: 'AM',
      bahia: 'BA',
      ceara: 'CE',
      distritofederal: 'DF',
      espiritosanto: 'ES',
      goias: 'GO',
      maranhao: 'MA',
      matogrosso: 'MT',
      matogrossodosul: 'MS',
      minasgerais: 'MG',
      para: 'PA',
      paraiba: 'PB',
      parana: 'PR',
      pernambuco: 'PE',
      piaui: 'PI',
      riodejaneiro: 'RJ',
      riograndedonorte: 'RN',
      riograndedosul: 'RS',
      rondonia: 'RO',
      roraima: 'RR',
      santacatarina: 'SC',
      saopaulo: 'SP',
      sergipe: 'SE',
      tocantins: 'TO',
    };

    return stateMap[normalized] || 'RS'; // default RS
  }

  /**
   * Normalizar string (remover acentos, espaços, lowercase)
   */
  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  /**
   * Validar se coordenadas estão no Brasil
   */
  validateBrazilianCoordinates(lat: number, lon: number): boolean {
    // Brasil: lat -33.75 a 5.27, lon -73.98 a -34.79
    return lat >= -33.75 && lat <= 5.27 && lon >= -73.98 && lon <= -34.79;
  }
}
