/**
 * Image Content Magic-Bytes Verification Utility
 * 
 * Verifies image file signatures (magic bytes) to guarantee that uploaded files
 * are authentic JPEG/PNG images rather than renamed malicious binaries.
 */

/**
 * Validates buffer header magic bytes.
 * JPEG: 0xFF 0xD8 0xFF
 * PNG: 0x89 0x50 0x4E 0x47
 */
const isValidImageMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

  return isJpeg || isPng;
};

module.exports = {
  isValidImageMagicBytes
};
