import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple valid PNG encoder using Node standard library
function createSolidPNG(width, height) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Deflate compression
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // No interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Draw inner L shape
      const normX = x / width;
      const normY = y / height;

      // Draw stylized "R"
      const isRStem = (normX >= 0.32 && normX <= 0.42 && normY >= 0.25 && normY <= 0.72);
      const isRTop = (normX >= 0.32 && normX <= 0.60 && normY >= 0.25 && normY <= 0.33);
      const isRMid = (normX >= 0.32 && normX <= 0.58 && normY >= 0.45 && normY <= 0.52);
      const isRRightCurve = (normX >= 0.52 && normX <= 0.62 && normY >= 0.28 && normY <= 0.48);
      const isRLeg = (normX >= 0.44 && normX <= 0.64 && normY >= 0.50 && normY <= 0.72 && (normX - 0.44) > (normY - 0.50) * 0.8 - 0.08 && (normX - 0.44) < (normY - 0.50) * 0.8 + 0.12);
      const isWhiteShape = isRStem || isRTop || isRMid || isRRightCurve || isRLeg;

      const isAccent = (normX >= 0.32 && normX <= 0.68 && normY >= 0.76 && normY <= 0.79);
      const isDot = Math.hypot(normX - 0.74, normY - 0.26) < 0.04;

      if (isDot || isAccent) {
        // Warm Amber (#F59E0B)
        rawData[pxOffset] = 245;
        rawData[pxOffset + 1] = 158;
        rawData[pxOffset + 2] = 11;
        rawData[pxOffset + 3] = 255;
      } else if (isWhiteShape) {
        // Warm Paper White (#FAF8F5)
        rawData[pxOffset] = 250;
        rawData[pxOffset + 1] = 248;
        rawData[pxOffset + 2] = 245;
        rawData[pxOffset + 3] = 255;
      } else {
        // Deep Charcoal (#1C1917)
        rawData[pxOffset] = 28;
        rawData[pxOffset + 1] = 25;
        rawData[pxOffset + 2] = 23;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createSolidPNG(32, 32));

console.log('Successfully generated all PWA icons!');
