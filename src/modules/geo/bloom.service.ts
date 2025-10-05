import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BoundingBox } from './types/raw-boundingBox';
import { BloomRecord, BloomResult } from './types/raw-bloom-result';

@Injectable()
export class BloomService {
  private readonly logger = new Logger(BloomService.name);
  private readonly STAC_ENDPOINT = process.env.PLANERATY_API_URL;

  constructor(private httpService: HttpService) {}

  async getBloomDataFromLocation(bbox: BoundingBox): Promise<BloomResult> {
    const now = new Date();
    const past = new Date(now);
    past.setMonth(now.getMonth() - 6);
    const datetime = `${past.toISOString().split('T')[0]}/${
      now.toISOString().split('T')[0]
    }`;

    const mountBbox = [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat];

    const body = {
      collections: ['sentinel-2-l2a'],
      bbox: mountBbox,
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
        'Error calling STAC /search',
        err.response?.data || err.toString(),
      );
      throw new HttpException('Error searching for STAC images', 500);
    }

    const items = response.data.features;
    if (!items || items.length === 0) {
      throw new HttpException('No images found for location', 404);
    }

    const historico: BloomRecord[] = items.map((item) => {
      const props = item.properties;
      const ndvi = this.estimateNdviFromMetadata(props);
      return {
        date: props.datetime,
        ndvi,
      };
    });

    historico.sort((a, b) => a.date.localeCompare(b.date));

    const ultimo = historico[historico.length - 1];
    const primeiro = historico[0];

    const indice = ultimo.ndvi;

    const variacaoRaw = ((ultimo.ndvi - primeiro.ndvi) / primeiro.ndvi) * 100;
    const variacao =
      (variacaoRaw >= 0 ? '+' : '') + variacaoRaw.toFixed(1) + '%';

    let tendencia: 'rising' | 'falling' | 'stable' = 'stable';
    if (variacaoRaw > 5) tendencia = 'rising';
    else if (variacaoRaw < -5) tendencia = 'falling';

    let status: BloomResult['status'] = 'none';
    if (indice < 0.2) status = 'none';
    else if (indice < 0.4) status = 'low';
    else if (indice < 0.6) status = 'medium';
    else if (indice < 0.8) status = 'high';
    else status = 'peak';

    let insight = `Current index: ${indice.toFixed(2)}. Trend: ${tendencia}.`;
    if (status === 'peak') {
      insight += ' Peak flowering detected.';
    } else if (status === 'high') {
      insight += ' Strong flowering underway.';
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

  private estimateNdviFromMetadata(props: any): number {
    const cloud = props['eo:cloud_cover'] || 0;
    const base = 0.8;

    const ndvi = base * (1 - cloud / 100);
    return Math.max(0, Math.min(ndvi, 1));
  }
}
