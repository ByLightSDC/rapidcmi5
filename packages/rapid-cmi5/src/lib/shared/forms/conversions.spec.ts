import { getStorageFitBytes } from './conversions';

describe('getStorageFitBytes', () => {
  it('should return kilobyte if 1000 bytes', () => {
    const display = getStorageFitBytes(1);
    expect(display).toEqual('1k');
  });

  it('should return k with single place decimal if 200 bytes', () => {
    const display = getStorageFitBytes(200);
    expect(display).toEqual('.2k');
  });

  it('should return kilobyte if < 1000 bytes', () => {
    const display = getStorageFitBytes(999);
    expect(display).toEqual('1k');
  });

  it('should return k if >= 1000 <= 1000000 bytes', () => {
    const display = getStorageFitBytes(500000);
    expect(display).toEqual('500k');
  });

  it('should return M if 1000000 bytes', () => {
    const display = getStorageFitBytes(1000000);
    expect(display).toEqual('1M');
  });

  it('should return M if >= 1000000 <= 1000000000 bytes', () => {
    const display = getStorageFitBytes(500000000);
    expect(display).toEqual('500M');
  });

  it('should return G if 1000000000 bytes', () => {
    const display = getStorageFitBytes(1000000000);
    expect(display).toEqual('1G');
  });

  it('should return T if 1000000000000 bytes', () => {
    const display = getStorageFitBytes(1000000000000);
    expect(display).toEqual('1T');
  });

  it('should return P if 1000000000000000 bytes', () => {
    const display = getStorageFitBytes(1000000000000000);
    expect(display).toEqual('1P');
  });

  it('should return E if 1000000000000000000 bytes', () => {
    const display = getStorageFitBytes(1000000000000000000);
    expect(display).toEqual('1E');
  });
});
