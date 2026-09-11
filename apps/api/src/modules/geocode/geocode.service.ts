import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry {
  data: ReverseGeocodeResult;
  expires: number;
}

export interface ReverseGeocodeResult {
  address: string | null;
  displayName: string | null;
}

@Injectable()
export class GeocodeService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 24 * 60 * 60 * 1000;
  private readonly maxEntries = 500;
  private readonly baseUrl: string;
  private readonly userAgent = process.env.GEOCODE_USER_AGENT || 'RadarQuito/0.1 (admin@radarquito.com)';

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('GEOCODE_BASE_URL') || 'https://nominatim.openstreetmap.org';
  }

  async reverse(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const roundedLat = lat.toFixed(5);
    const roundedLng = lng.toFixed(5);
    const key = `${roundedLat},${roundedLng}`;

    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await this.resolveFromProvider(lat, lng);

    this.cache.set(key, { data, expires: Date.now() + this.ttlMs });

    if (this.cache.size > this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    return data;
  }

  private async resolveFromProvider(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      const url = `${this.baseUrl}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'es',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { address: null, displayName: null };
      }

      const json = (await res.json()) as { display_name?: string };
      return {
        address: json.display_name ?? null,
        displayName: json.display_name ?? null,
      };
    } catch {
      return { address: null, displayName: null };
    }
  }
}