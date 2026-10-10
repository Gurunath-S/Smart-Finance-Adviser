const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isValidImageMagicBytes } = require('../utils/imageValidation');

describe('Image Magic-Bytes Validation Unit Tests', () => {
  it('identifies authentic JPEG header magic bytes', () => {
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    assert.equal(isValidImageMagicBytes(jpegHeader), true);
  });

  it('identifies authentic PNG header magic bytes', () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);
    assert.equal(isValidImageMagicBytes(pngHeader), true);
  });

  it('rejects executable / script / arbitrary binary headers', () => {
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
    const exeHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00]); // MZ (Windows PE)
    const emptyBuf = Buffer.from([]);

    assert.equal(isValidImageMagicBytes(pdfHeader), false);
    assert.equal(isValidImageMagicBytes(exeHeader), false);
    assert.equal(isValidImageMagicBytes(emptyBuf), false);
  });
});
