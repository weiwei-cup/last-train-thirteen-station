import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the complete game shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>末班车：十三号站 V2.5｜动态闸机令<\/title>/i);
  assert.match(html, /零点之后/);
  assert.match(html, /开始今晚值班/);
  assert.match(html, /值班手册/);
  assert.match(html, /乘客档案/);
  assert.match(html, /调查牌组/);
  assert.match(html, /十八次处置、逐人变化的闸机令与三级复核/);
  assert.match(html, /动态闸机令/);
  assert.match(html, /三级复核/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});
