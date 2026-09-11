import { describe, it, expect, vi } from 'vitest';
import { ReportImagesService } from '../report-images.service';

describe('ReportImagesService', () => {
  it('should be instantiable with mocks', () => {
    const service = new ReportImagesService({} as never, {
      getFileUrl: vi.fn(() => 'https://cdn.example.com/img.png'),
    } as never);
    expect(service).toBeDefined();
  });

  it('should have a confirmImage method that accepts a userId', () => {
    expect(typeof ReportImagesService.prototype.confirmImage).toBe('function');
    expect(ReportImagesService.prototype.confirmImage.length).toBe(3);
  });

  it('should have a deleteImage method', () => {
    expect(typeof ReportImagesService.prototype.deleteImage).toBe('function');
  });
});