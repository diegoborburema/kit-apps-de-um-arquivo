/* Confere o núcleo do index.html de {{NOME}} contra as fixtures, sem navegador.

Uso (de qualquer pasta; precisa só do Node.js 18 ou mais novo):
    node {{app}}/testes/conferir_codigo.js

O que confere:
  1. O index.html tem os blocos nucleo e interface, e o núcleo não toca no DOM.
  2. <uma linha por verificação, na ordem em que roda>
Sai com erro na primeira falha.

Pré-requisito no index.html: <script id="nucleo"> declara um objeto global (aqui, APP) com as funções a testar,
sem usar document, window, localStorage nem navigator.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const RAIZ = path.resolve(__dirname, '..');            // pasta do app
const FIX = path.join(__dirname, 'fixtures');
const HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function ok(msg) { console.log('ok  ' + msg); }
function bloco(id) {
  const m = HTML.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  assert(m, 'bloco <script id="' + id + '"> não encontrado');
  return m[1];
}
// Roda o núcleo no contexto normal do Node (não em vm: lá cada acesso a Math e afins fica muito mais lento).
const APP = new Function(bloco('nucleo') + '\nreturn APP;')();

(async () => {
  // 1. Blocos e núcleo sem DOM
  const nucleo = bloco('nucleo').replace(/\/\*[\s\S]*?\*\//g, '');
  bloco('interface');
  assert(!/\b(document|window|localStorage|navigator)\b/.test(nucleo), 'o núcleo não pode usar document, window, localStorage nem navigator');
  ok('blocos nucleo e interface; núcleo sem DOM');

  // 2. ...
  // const r = APP.importar(fs.readFileSync(path.join(FIX, 'entrada.csv'), 'utf8'));
  // assert.strictEqual(r.linhas, 10, 'linhas importadas');
  // ok('importação da fixture');

  console.log('\nTudo certo.');
})().catch(e => { console.error('\nFALHOU: ' + (e && e.message || e)); process.exit(1); });
