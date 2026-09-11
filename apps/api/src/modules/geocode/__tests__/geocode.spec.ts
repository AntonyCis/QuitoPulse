import { describe, it, expect } from 'vitest';
import { GeocodeService } from '../geocode.service';
import { GeocodeController } from '../geocode.controller';

describe('GeocodeService', () => {
  it('should be instantiable', () => {
    const service = new GeocodeService({ get: () => 'https://nominatim.openstreetmap.org' } as never);
    expect(service).toBeDefined();
  });

  it('should have a reverse method', () => {
    expect(typeof GeocodeService.prototype.reverse).toBe('function');
  });
});

describe('GeocodeController', () => {
  it('should have a reverse endpoint', () => {
    expect(typeof GeocodeController.prototype.reverse).toBe('function');
  });
});