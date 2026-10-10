const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Profile Upload Security & Validation Tests', () => {
  it('validates allowed MIME types for profile picture uploads', () => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const isValidMime = (mime) => allowedMimeTypes.includes(mime);

    assert.equal(isValidMime('image/jpeg'), true);
    assert.equal(isValidMime('image/png'), true);
    assert.equal(isValidMime('application/pdf'), false);
    assert.equal(isValidMime('text/html'), false);
    assert.equal(isValidMime('application/javascript'), false);
  });

  it('enforces 5MB maximum file size limit', () => {
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    const isWithinLimit = (bytes) => bytes <= maxSizeBytes;

    assert.equal(isWithinLimit(2 * 1024 * 1024), true);  // 2MB -> Allowed
    assert.equal(isWithinLimit(5 * 1024 * 1024), true);  // 5MB -> Allowed
    assert.equal(isWithinLimit(6 * 1024 * 1024), false); // 6MB -> Rejected
  });
});
