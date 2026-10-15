import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [{ video: file }] = JSON.parse(await readFile(new URL('../assets/data/aigc-works.json', import.meta.url), 'utf8'));
const bytes = await readFile(new URL('../' + file, import.meta.url));
const url = 'http://127.0.0.1:4173/' + file;
for (const [range, start, end] of [['bytes=0-31', 0, 32], ['bytes=-32', bytes.length - 32, bytes.length], [`bytes=${bytes.length - 32}-`, bytes.length - 32, bytes.length]]) {
  const response = await fetch(url, { headers: { Range: range } });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), `bytes ${start}-${end - 1}/${bytes.length}`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end));
}
for (const range of [`bytes=${bytes.length}-`, 'bytes=20-10', 'bytes=-0', 'bytes=-', 'bytes=abc']) {
  const response = await fetch(url, { headers: { Range: range } });
  assert.equal(response.status, 416);
  assert.equal(response.headers.get('content-range'), `bytes */${bytes.length}`);
  await response.arrayBuffer();
}
const head = await fetch(url, { method: 'HEAD' });
assert.equal(head.headers.get('content-length'), String(bytes.length));
assert.equal(head.headers.get('accept-ranges'), 'bytes');
assert.equal((await head.arrayBuffer()).byteLength, 0);
console.log('通过：视频分段读取、文件尾读取、非法范围及 HEAD 请求。');
