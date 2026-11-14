/* Confere o núcleo do index.html contra as fixtures, sem navegador.

Uso (de qualquer pasta; precisa só do Node.js 18 ou mais novo):
    node hackathon-team-builder/testes/conferir_codigo.js

O que confere:
  1. O index.html tem os 3 blocos (exemplo, nucleo, interface) e o núcleo não toca no DOM.
  2. O exemplo embutido no HTML é igual aos arquivos de exemplo/.
  3. Importação no formato do Forms (fixtures/forms_armadilhas.csv) com os desafios já importados: colunas Opção A/B/C lidas, nenhum desafio fantasma,
     D1 = D01, "-", "N/A" e "Nenhuma" em branco, código + descrição, só a descrição, código inexistente, preferência repetida,
     nome repetido, senioridade, gênero, disponibilidade, perfil por pessoa e quem fica fora dos grupos.
  4. Importação sem desafios: eles são criados a partir das preferências, inclusive numa reimportação.
  5. Demanda sem contar preferência repetida; mínimo do grupo nunca acima do máximo.
  6. Custo incremental do otimizador igual ao custo recalculado do zero.
  7. Mesma semente, mesmo resultado.
  8. Qualidade no exemplo, 8 sementes: tamanhos dentro do mínimo e máximo, ninguém fora das opções, cabeça de chave em todo time,
     senioridade efetiva com diferença de até 3 pontos entre times,
     no máximo 3 distribuições diferentes, a mais frequente em pelo menos 6 de 8, e média na 1ª opção de pelo menos 21 de 33.
  9. Fixação: o 📌 se mantém quando o desafio passa de 1 para 2 times, e um time fixado não desaparece.
 10. Sessão salva pela v1.0.0 (fixtures/sessao_v1.0.0.json): chaves migradas e fixações preservadas.
 11. Exportação: célula que viraria fórmula no Excel sai com apóstrofo; HTML escapado.
 12. Tempo de uma simulação com 120 pessoas e 10 desafios (só informa; falha acima de 60 s).
Sai com erro na primeira falha.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const RAIZ = path.resolve(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures');
const HTML = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function ok(msg) { console.log('ok  ' + msg); }
function bloco(id) {
  const m = HTML.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  assert(m, 'bloco <script id="' + id + '"> não encontrado');
  return m[1];
}
function carregar() { return new Function(bloco('exemplo') + '\n' + bloco('nucleo') + '\nreturn {H: HTB, DEMO: DEMO};')(); }
function ler(rel) { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); }

const { H, DEMO } = carregar();
function novo() { const s = H.defaults(); H.use(s); H.sanitize(); return s; }
function exemplo() {
  const s = H.defaults(); s.des = H.clone(DEMO.des);
  s.people = H.clone(DEMO.people).map((p, i) => { p.id = i + 1; return p; }); s.nextId = s.people.length + 1;
  H.use(s); H.sanitize(); return s;
}
function pessoa(S, nome) { const p = S.people.filter(x => x.nome === nome); assert(p.length, 'pessoa não encontrada: ' + nome); return p; }
function prefsDe(p) { return [p.p1, p.p2, p.p3].join('/'); }
function metricas(S, r) {
  const P = H.pool(), G = r.groups, keys = G.map(g => g.key), a = P.map(p => keys.indexOf(r.assign[p.id]));
  const sz = G.map((g, i) => a.filter(x => x === i).length);
  const cab = G.map((g, i) => P.filter((p, j) => a[j] === i && H.isCh(p)).length);
  const sen = G.map((g, i) => P.reduce((t, p, j) => t + (a[j] === i ? H.senPts(p) : 0), 0));
  const rk = [0, 0, 0, 0, 0]; P.forEach((p, i) => { const k = H.prefRank(p, G[a[i]].code); rk[k < 0 ? 4 : k]++; });
  return { sz, cab, sen, rk, alloc: H.codes().map(c => r.alloc[c] || 0).join(',') };
}

(async () => {
  // 1. Blocos e núcleo sem DOM
  const nucleo = bloco('nucleo').replace(/\/\*[\s\S]*?\*\//g, '');
  bloco('interface'); bloco('exemplo');
  assert(!/\b(document|window|localStorage|navigator)\b/.test(nucleo), 'o núcleo não pode usar document, window, localStorage nem navigator');
  ok('index.html com os blocos exemplo, nucleo e interface; núcleo sem DOM (versão ' + H.VERSION + ')');

  // 2. Exemplo embutido = exemplo/*.csv
  let S = novo();
  let r = H.importDes(ler('exemplo/desafios_exemplo.csv'), true); assert(r.ok, r.lines.join('\n'));
  r = H.importPeople(ler('exemplo/participantes_exemplo.csv'), true); assert(r.ok, r.lines.join('\n'));
  assert.deepStrictEqual(S.des, DEMO.des, 'desafios do exemplo embutido diferentes de exemplo/desafios_exemplo.csv');
  const campos = ['nome', 'area', 'sen', 'sexo', 'chave', 'entra', 'aloc', 'p1', 'p2', 'p3', 'obs'];
  assert.strictEqual(S.people.length, DEMO.people.length, 'nº de participantes do exemplo');
  S.people.forEach((p, i) => campos.forEach(k => assert.strictEqual(String(p[k]), String(DEMO.people[i][k]), 'exemplo, ' + p.nome + ', campo ' + k)));
  ok('exemplo embutido igual a exemplo/ (' + S.people.length + ' pessoas, ' + Object.keys(S.des).length + ' desafios)');

  // 3. Importação no formato do Forms, com os desafios já importados
  S = novo();
  H.importDes(ler('exemplo/desafios_exemplo.csv'), true);
  r = H.importPeople(ler('testes/fixtures/forms_armadilhas.csv'), true);
  assert(r.ok, r.lines.join('\n'));
  const log = r.lines.join('\n');
  assert(!/coluna de preferência|Colunas não encontradas/.test(log), 'colunas Opção A/B/C não reconhecidas: ' + log);
  assert.deepStrictEqual(H.codes(), ['D01', 'D02', 'D03', 'D04', 'D05', 'D06'], 'apareceu desafio fantasma: ' + H.codes().join(','));
  assert.strictEqual(S.people.length, 26);
  assert.strictEqual(H.pool().length, 23, 'pool');
  const esperado = {
    'Marcos Teles': 'D01/D03/D02',          // D1 = D01
    'Renata Okada': 'D02/D05/D01',          // "D02 · Onboarding..."
    'Paulo Viana': 'D04/D01/D06',           // só a descrição
    'Bia Fonseca': 'D03//D05',              // D03 repetido
    'Tomás Reis': '/D02/D06',               // D09 não existe
    'Sílvia Rocha': '//D04',                // "-" e "N/A"
    'Gisele Matos': '//',                   // "Nenhuma"
    'Helena Dias': '//'
  };
  Object.keys(esperado).forEach(n => assert.strictEqual(prefsDe(pessoa(S, n)[0]), esperado[n], 'preferências de ' + n));
  assert(/D09/.test(log) && /não corresponde/.test(log), 'falta o aviso do código inexistente D09');
  assert(/D03 repetido como 2ª opção/.test(log), 'falta o aviso da preferência repetida');
  assert(/Nomes repetidos.*Laura Mendes \(linhas 2 e 23\)/.test(log), 'falta o aviso do nome repetido');
  assert.strictEqual(pessoa(S, 'Paulo Viana')[0].sen, 'Senior', 'Especialista = Senior');
  assert.strictEqual(pessoa(S, 'Paulo Viana')[0].chave, 'A confirmar');
  assert.strictEqual(pessoa(S, 'Otávio Lins')[0].sen, 'Pleno', 'Gerente → Pleno');
  assert(/Otávio Lins\): senioridade "Gerente" não reconhecida/.test(log), 'falta o aviso da senioridade');
  assert.strictEqual(pessoa(S, 'Alex Moura')[0].sexo, '', 'Prefiro não dizer = vazio');
  assert.strictEqual(pessoa(S, 'Alex Moura')[0].aloc, 50, '0,5 = 50%');
  assert.strictEqual(pessoa(S, 'Renata Okada')[0].aloc, 50, '50% = 50');
  assert.strictEqual(H.prof(pessoa(S, 'Bia Fonseca')[0]), 'DS', 'perfil DS por pessoa');
  assert.strictEqual(H.prof(pessoa(S, 'Igor Prado')[0]), 'DE', 'perfil DE por pessoa, mesma área');
  assert.strictEqual(H.prof(pessoa(S, 'Mauro Siqueira')[0]), 'DS');
  assert.strictEqual(pessoa(S, 'Patrícia Gil')[0].entra, 'Não');
  ok('importação do Forms: sem desafios fantasmas, D1 = D01, vazios, descrição, D09, repetidos, níveis, gênero, disponibilidade, perfil');

  // 4. Sem desafios importados: são criados a partir das preferências, também na reimportação
  S = novo();
  const sem = 'Nome;Pref1;Pref2;Pref3\nAna;D01 · Primeiro;D02 · Segundo;\nBia;D2;D01;Tema livre com nome longo\n';
  r = H.importPeople(sem, true); assert(r.ok);
  assert.deepStrictEqual(H.codes(), ['D01', 'D02', 'D03'], 'desafios criados: ' + H.codes().join(','));
  assert.strictEqual(prefsDe(pessoa(S, 'Bia')[0]), 'D02/D01/D03', 'D2 = D02 e tema livre vira D03');
  r = H.importPeople(sem + 'Caio;D04 · Quarto;;\n', true);
  assert(H.codes().indexOf('D04') >= 0, 'na reimportação, desafio novo nas preferências também é criado');
  ok('sem desafios importados: criados a partir das preferências (' + H.codes().join(', ') + ')');

  // 5. Demanda e tamanhos
  S = exemplo();
  const antes = H.demand().D03.slice();
  const fer = pessoa(S, 'Fernanda Vasconcelos')[0]; fer.p2 = fer.p1;   // D03 também como 2ª opção
  assert.deepStrictEqual(H.demand().D03, [antes[0], antes[1], antes[2]], 'preferência repetida não pode contar duas vezes');
  S.gmin = 5; S.gmax = 8; H.setTamanho('min', 10);
  assert(S.gmin === 10 && S.gmax === 10, 'mínimo acima do máximo: ' + S.gmin + '–' + S.gmax);
  H.setTamanho('max', 3); assert(S.gmax === 10, 'máximo não pode ficar abaixo do mínimo');
  ok('demanda sem dupla contagem; mínimo nunca acima do máximo');

  // 6. Custo incremental = custo recalculado
  S = exemplo();
  let P = H.pool(), G = H.buildGroups({ D01: 2, D02: 1, D03: 1, D04: 1, D05: 1, D06: 0 });
  const E = H.makeEval(P, G), a = P.map((_, i) => i % G.length), st = E.estado(a);
  let x = 12345, desvio = 0;
  const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
  for (let t = 0; t < 3000; t++) {
    st.mover(rnd() * P.length | 0, rnd() * G.length | 0);
    if (t % 100 === 0) desvio = Math.max(desvio, Math.abs(st.total() - E.cost(a)));
  }
  desvio = Math.max(desvio, Math.abs(st.total() - E.cost(a)));
  assert(desvio < 1e-6, 'custo incremental diverge: ' + desvio);
  ok('custo incremental igual ao recalculado (desvio máximo ' + desvio.toExponential(1) + ' em 3.000 movimentos)');

  // 7. Mesma semente, mesmo resultado
  S = exemplo(); const r1 = await H.simular({ seed: 42 });
  S = exemplo(); const r2 = await H.simular({ seed: 42 });
  assert.deepStrictEqual(r1.assign, r2.assign, 'mesma semente deu times diferentes');
  assert.deepStrictEqual(r1.alloc, r2.alloc);
  ok('semente 42 duas vezes: mesmos times');

  // 8. Qualidade no exemplo
  const dist = {}, primeira = [];
  let difSen = 0;
  for (let s = 1; s <= 8; s++) {
    S = exemplo(); const rr = await H.simular({ seed: s }), m = metricas(S, rr);
    m.sz.forEach(n => assert(n >= S.gmin && n <= S.gmax, 'semente ' + s + ': time com ' + n + ' pessoas'));
    assert.strictEqual(m.rk[4], 0, 'semente ' + s + ': ' + m.rk[4] + ' pessoa(s) fora das opções');
    m.cab.forEach(n => assert(n >= 1, 'semente ' + s + ': time sem cabeça de chave'));
    difSen = Math.max(difSen, Math.max(...m.sen) - Math.min(...m.sen));
    dist[m.alloc] = (dist[m.alloc] || 0) + 1; primeira.push(m.rk[1]);
  }
  const media = primeira.reduce((u, v) => u + v, 0) / primeira.length;
  assert(Object.keys(dist).length <= 3, 'distribuições demais entre sementes: ' + JSON.stringify(dist));
  assert(Math.max(...Object.values(dist)) >= 6, 'a distribuição mais frequente saiu em menos de 6 de 8 sementes: ' + JSON.stringify(dist));
  assert(media >= 21, 'média na 1ª opção caiu: ' + media);
  assert(difSen <= 3, 'senioridade desequilibrada: diferença de ' + difSen + ' pontos entre times');
  ok('qualidade no exemplo, 8 sementes: tamanhos ok, 0 fora das opções, cabeça em todo time, senioridade com diferença máx. ' + H.fmt(difSen) + ' pts, 1ª opção média ' + media.toFixed(1) +
     ' de 33, distribuições ' + JSON.stringify(dist));

  // 9. Fixação
  S = exemplo(); S.ch.D03 = 1;
  let rr = await H.simular({ seed: 7 }); S.alloc = rr.alloc; S.groups = rr.groups; S.assign = rr.assign;
  const fora = H.pool().find(p => S.assign[p.id].split('#')[0] !== 'D03');
  S.assign[fora.id] = 'D03#1'; S.pins[fora.id] = 'D03#1'; S.ch.D03 = 2;
  rr = await H.simular({ seed: 7, keep: true });
  assert.strictEqual(rr.alloc.D03, 2);
  assert.strictEqual(rr.assign[fora.id], 'D03#1', 'pessoa fixada saiu do time: ' + rr.assign[fora.id]);
  assert(rr.groups.some(g => g.key === S.pins[fora.id]), 'o time da fixação deixou de existir');
  S = exemplo(); S.pins[pessoa(S, 'Caio Farias')[0].id] = 'D06#2';
  rr = await H.simular({ seed: 3, keep: true });
  assert(rr.alloc.D06 >= 2 && rr.assign[pessoa(S, 'Caio Farias')[0].id] === 'D06#2', 'time fixado D06#2 desapareceu');
  ok('fixação mantida quando o desafio passa de 1 para 2 times; time fixado não desaparece');

  // 10. Sessão da v1.0.0
  const velha = JSON.parse(fs.readFileSync(path.join(FIX, 'sessao_v1.0.0.json'), 'utf8'));
  const pinsVelhos = H.clone(velha.pins);
  S = H.use(velha); H.sanitize();
  assert(S.groups.every(g => /#\d+$/.test(g.key)), 'chaves de time sem #');
  Object.keys(pinsVelhos).forEach(id => assert.strictEqual(S.pins[id], pinsVelhos[id].indexOf('#') < 0 ? pinsVelhos[id] + '#1' : pinsVelhos[id]));
  assert(H.validGroups().every(g => H.members(g).length >= S.gmin), 'time vazio depois da migração');
  rr = await H.simular({ seed: 11, keep: true });
  Object.keys(S.pins).forEach(id => assert.strictEqual(rr.assign[id], S.pins[id], 'fixação da sessão antiga perdida no recálculo'));
  ok('sessão da v1.0.0: chaves migradas (' + Object.values(pinsVelhos).join(', ') + ' → ' + Object.values(S.pins).join(', ') + ') e fixações mantidas no recálculo');

  // 11. Exportação e escape
  S = exemplo(); rr = await H.simular({ seed: 5 }); S.alloc = rr.alloc; S.groups = rr.groups; S.assign = rr.assign;
  S.people[0].nome = '=HYPERLINK("http://exemplo.invalid","clique")'; S.people[1].nome = '+5'; S.people[2].nome = '@SOMA(A1)';
  const csv = H.toCSV(H.exportRows());
  assert(csv.indexOf('"\'=HYPERLINK(') >= 0 && csv.indexOf('"\'+5"') >= 0 && csv.indexOf('"\'@SOMA(A1)"') >= 0, 'célula com fórmula sem apóstrofo');
  assert(!/(^|;)"[=+@]/m.test(csv), 'ainda há célula começando com = + @');
  assert.strictEqual(H.esc('<img src=x onerror="a">\''), '&lt;img src=x onerror=&quot;a&quot;&gt;&#39;');
  ok('exportação sem fórmulas injetáveis; HTML escapado');

  // 12. Tempo com 120 pessoas e 10 desafios
  S = novo(); let sd = 7; const rd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 1; i <= 10; i++) S.des['D' + String(i).padStart(2, '0')] = 'Desafio ' + i;
  const cs = Object.keys(S.des), sens = ['Junior', 'Pleno', 'Senior'], areas = ['Engenharia de Dados', 'Ciência de Dados', 'Produto de Dados', 'Negócio'];
  for (let i = 1; i <= 120; i++) {
    const sh = cs.slice().sort(() => rd() - 0.5);
    S.people.push({ id: i, nome: 'P' + i, area: areas[i % 4], sen: sens[i % 3], sexo: i % 2 ? 'F' : 'M', chave: i % 12 === 0 ? 'Sim' : 'Não', entra: 'Sim', aloc: 100, p1: sh[0], p2: sh[1], p3: sh[2], obs: '' });
  }
  S.nextId = 121; H.sanitize();
  const t0 = Date.now(); rr = await H.simular({ seed: 1 }); const seg = (Date.now() - t0) / 1000;
  assert(seg < 60, 'simulação lenta demais: ' + seg + ' s');
  const m120 = metricas(S, rr);
  ok('120 pessoas e 10 desafios: ' + seg.toFixed(1) + ' s, ' + rr.groups.length + ' times de ' + Math.min(...m120.sz) + ' a ' + Math.max(...m120.sz) + ', ' + m120.rk[4] + ' fora das opções');

  console.log('\nTudo certo.');
})().catch(e => { console.error('\nFALHOU: ' + (e && e.message || e)); process.exit(1); });
