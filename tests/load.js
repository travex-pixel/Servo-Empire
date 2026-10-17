// Loads the <script> from index.html into a Node vm context in headless mode and returns the exports.
const fs = require('fs'), path = require('path'), vm = require('vm');
function loadGame(opts = {}) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const start = html.indexOf('<script>') + '<script>'.length;
  const endIdx = html.lastIndexOf('</script>');
  const src = html.slice(start, endIdx > start ? endIdx : undefined);
  const sandbox = { SERVO_HEADLESS: true, console, Buffer, setInterval, clearInterval, setTimeout, clearTimeout, performance: { now: () => Date.now() } };
  if (opts.localStorage) sandbox.localStorage = opts.localStorage;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'index.html' });
  return sandbox.ServoEmpire;
}
function fakeStorage() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; }
module.exports = { loadGame, fakeStorage };
