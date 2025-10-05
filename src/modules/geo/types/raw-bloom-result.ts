export interface BloomRecord {
  date: string;
  ndvi: number;
  cloudCover: number;
}

export interface BloomResult {
  status: 'none' | 'low' | 'medium' | 'high' | 'peak';
  indice: number;
  variacao: string;
  tendencia: 'rising' | 'falling' | 'stable';
  historico: BloomRecord[];
  insight: string;
}
