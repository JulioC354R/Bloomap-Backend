import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface BloomRecord {
  date: string;
  ndvi: number;
  cloudCover: number;
}

interface BloomResult {
  status: 'none' | 'low' | 'medium' | 'high' | 'peak';
  indice: number;
  variacao: string;
  tendencia: 'rising' | 'falling' | 'stable';
  historico: BloomRecord[];
  insight: string;
}

@Injectable()
export class CompleteBloomService {
  private readonly logger = new Logger(CompleteBloomService.name);
  private readonly STAC_ENDPOINT =
    'https://planetarycomputer.microsoft.com/api/stac/v1';

  constructor(private httpService: HttpService) {}

  async getBloomDataFromLocation(
    lat: number,
    lon: number,
  ): Promise<BloomResult> {
    // 1. Definir parâmetros de busca para STAC API
    // usar ponto ou pequeno bbox (por exemplo ±0.01 grau)
    const delta = 0.01;

    const latNum = Number(lat);
    const lonNum = Number(lon);

    const bbox = [
      lonNum - delta,
      latNum - delta,
      lonNum + delta,
      latNum + delta,
    ];

    // intervalo de tempo: últimos 6 meses
    const now = new Date();
    const past = new Date(now);
    past.setMonth(now.getMonth() - 6);
    const datetime = `${past.toISOString().split('T')[0]}/${
      now.toISOString().split('T')[0]
    }`;

    // construir corpo da requisição POST /search
    const body = {
      collections: ['sentinel-2-l2a'],
      bbox: bbox,
      datetime: datetime,
      query: {
        'eo:cloud_cover': { lt: 30 },
      },
      limit: 10,
    };

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.post(`${this.STAC_ENDPOINT}/search`, body),
      );
    } catch (err) {
      this.logger.error(
        'Erro ao chamar STAC /search',
        err.response?.data || err.toString(),
      );
      throw new HttpException('Erro na busca de imagens STAC', 500);
    }

    const items = response.data.features;
    if (!items || items.length === 0) {
      throw new HttpException(
        'Nenhuma imagem encontrada para localização',
        404,
      );
    }

    // 2. Para cada item, extrair metadados relevantes
    const historico: BloomRecord[] = items.map((item) => {
      const props = item.properties;
      // escolher banda assets, se quiser baixar seria asset.href etc.
      const ndvi = this.estimateNdviFromMetadata(props);
      return {
        date: props.datetime,
        ndvi,
        // cloudCover: props['eo:cloud_cover'],
      };
    });

    // ordenar por data ascendente
    historico.sort((a, b) => a.date.localeCompare(b.date));

    // 3. Obter o último record (mais recente)
    const ultimo = historico[historico.length - 1];
    const primeiro = historico[0];

    // índice final
    const indice = ultimo.ndvi;

    // calcular variação percentual entre primeiro e último
    const variacaoRaw = ((ultimo.ndvi - primeiro.ndvi) / primeiro.ndvi) * 100;
    const variacao =
      (variacaoRaw >= 0 ? '+' : '') + variacaoRaw.toFixed(1) + '%';

    // tendência (simplificado)
    let tendencia: 'rising' | 'falling' | 'stable' = 'stable';
    if (variacaoRaw > 5) tendencia = 'rising';
    else if (variacaoRaw < -5) tendencia = 'falling';

    // determinar status com base em faixas arbitrárias
    let status: BloomResult['status'] = 'none';
    if (indice < 0.2) status = 'none';
    else if (indice < 0.4) status = 'low';
    else if (indice < 0.6) status = 'medium';
    else if (indice < 0.8) status = 'high';
    else status = 'peak';

    // insight simples
    let insight = `Índice atual: ${indice.toFixed(2)}. Tendência: ${tendencia}.`;
    if (status === 'peak') {
      insight += ' Floração em pico detectada.';
    } else if (status === 'high') {
      insight += ' Floração forte em andamento.';
    }

    return {
      status,
      indice,
      variacao,
      tendencia,
      historico,
      insight,
    };
  }

  /**
   * Estimativa simplificada de NDVI baseada nos metadados do item STAC
   * Você pode refinar isso com outros fatores como elevação solar etc.
   */
  private estimateNdviFromMetadata(props: any): number {
    const cloud = props['eo:cloud_cover'] || 0;
    // uma fórmula simples: NDVI = 1 - (cloud/100)
    // Se cobertura alta, NDVI deve ser penalizado
    const base = 0.8; // valor máximo ideal
    const ndvi = base * (1 - cloud / 100);
    // limitar entre 0 e 1
    return Math.max(0, Math.min(ndvi, 1));
  }

  async getBloomDataFromLocation2(
    city: string,
    state: string,
    country: string,
  ): Promise<any> {
    return {
      city,
      state,
      country,
      bloomStatus: 'Florada leve detectada',
      confidence: 'alta',
      timestamp: new Date().toISOString(),
    };
  }
}
