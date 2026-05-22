import { BridgetechService } from './bridgetech-service.js';

describe('bridgetech service', () => {
  it('should construct without error', () => {
    const svc = BridgetechService.from();
    expect(svc).toBeInstanceOf(BridgetechService);
  });
});
