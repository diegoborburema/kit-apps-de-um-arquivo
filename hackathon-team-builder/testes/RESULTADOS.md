# Hackathon Team Builder: resultados da bateria

Uma coluna por versão. Critérios e roteiros: [`PERGUNTAS-DE-CONTROLE.md`](PERGUNTAS-DE-CONTROLE.md).

✓ aprovado · ✗ reprovado · – não exercitado · n/a: não se aplica à versão

- `conferir_codigo.js`: v1.1.0 ✓ em 2026-11-13.
- `conferir_navegador.py`: v1.1.0 ✓ em 2026-11-13 (Chrome sem janela; o visualizador embutido foi simulado com um iframe).
- **Coluna v1.0.0:** preenchida na revisão de 2026-11-13, rodando a v1.0.0 no Chrome sem janela contra as mesmas entradas. Para IMP-01 a IMP-09, as colunas "Opção A/B/C" da fixture foram renomeadas para Pref1/2/3, porque com o nome original a v1.0.0 não lê nenhuma preferência (IMP-00). Os ✗ são os defeitos corrigidos na v1.1.0 (ver Decisões em `NOTAS.md`).
- Nada foi rodado ainda num Excel, numa impressora ou no SharePoint/Teams de verdade: essas perguntas estão como "–".

| Cenário | ID | Sev. | v1.0.0 | v1.1.0 | Observação |
|---|---|---|---|---|---|
| A | FLX-01 | C | – | ✓ | |
| A | FLX-02 | C | ✓ | ✓ | v1.0.0: times de 6 a 7 nos 5 cálculos |
| A | FLX-03 | C | ✓ | ✓ | |
| A | FLX-04 | I | ✓ | ✓ | |
| A | FLX-05 | I | ✓ | ✓ | v1.0.0: 26 a 27 pts; v1.1.0: diferença máx. de 1 pt em 8 sementes |
| A | FLX-06 | I | ✗ | ✓ | v1.0.0: 5 distribuições em 5 cálculos; v1.1.0: a mesma em 7 de 8 |
| A | FLX-07 | D | ✗ | ✓ | v1.0.0: 20,6; v1.1.0: 21,8 |
| A | FMT-01 | I | – | – | |
| A | FMT-02 | I | – | – | |
| B | IMP-00 | C | ✗ | ✓ | v1.0.0: 23 pessoas "Sem pref.", aviso só no log |
| B | IMP-01 | C | ✗ | ✓ | v1.0.0: criou D1, D09, -, N/A e NENHUMA |
| B | IMP-02 | C | ✗ | ✓ | |
| B | IMP-03 | I | ✗ | ✓ | |
| B | IMP-04 | I | ✓ | ✓ | |
| B | IMP-05 | I | ✗ | ✓ | |
| B | IMP-06 | I | ✗ | ✓ | |
| B | IMP-07 | I | ✗ | ✓ | |
| B | IMP-08 | I | ✓ | ✓ | |
| B | IMP-09 | I | ✗ | ✓ | v1.0.0: área "Dados" inteira virou DS |
| B | IMP-10 | C | ✓ | ✓ | |
| B | DAD-01 | C | – | – | |
| C | PIN-01 | C | – | ✓ | |
| C | PIN-02 | C | ✗ | ✓ | v1.0.0: fixação em D03 perdida quando D03 passou a 2 times |
| C | PIN-03 | I | – | – | |
| C | REP-01 | I | n/a | ✓ | a v1.0.0 não tem semente |
| C | ROB-01 | I | ✗ | ✓ | v1.0.0: "Automático (5–3)" |
| C | ROB-02 | I | ✗ | – | v1.0.0: 8,3 s com a tela travada; v1.1.0: 4,0 s medidos, falta ver a tela respondendo |
| D | SES-01 | C | – | – | |
| D | SES-02 | C | n/a | ✓ | |
| D | SES-03 | I | – | – | |
| E | EMB-01 | I | – | ✓ | iframe simulado |
| E | EMB-02 | I | – | ✓ | iframe simulado |
| E | EMB-03 | I | – | – | |
| E | EMB-04 | D | – | – | |
| F | PRV-01 | C | – | ✓ | |
| F | PRV-02 | C | – | ✓ | |
| F | PRV-03 | I | ✗ | ✓ | v1.0.0: `=HYPERLINK(...)` exportado sem apóstrofo |
