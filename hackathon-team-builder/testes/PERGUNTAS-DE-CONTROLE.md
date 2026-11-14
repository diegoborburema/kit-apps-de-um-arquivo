# Hackathon Team Builder: perguntas de controle

Bateria de regressão do app. Cada versão roda a bateria antes do merge, e o resultado entra em [`RESULTADOS.md`](RESULTADOS.md) (uma coluna por versão).

Os dois conferidores automáticos cobrem boa parte dela (a coluna **Auto** diz qual). O que só uma pessoa consegue ver (Excel, impressão, SharePoint/Teams de verdade) fica para o roteiro manual.

```
node hackathon-team-builder/testes/conferir_codigo.js         ← núcleo, sem navegador
python hackathon-team-builder/testes/conferir_navegador.py    ← interface, Chrome sem janela (opcional)
```

## Como usar

**O que rodar depende do que mudou.**

| Mudou | Rodar |
|---|---|
| Só texto da tela ou do README | Cenário A |
| Importação (cabeçalhos, normalização, preferências) | `conferir_codigo.js` + Cenário B |
| Otimizador, regras, pesos, nº de times | `conferir_codigo.js` + Cenários A e C |
| Sessão, fixação, chaves dos times | `conferir_codigo.js` + Cenários C e D |
| Exportação, impressão, visualizador embutido | Cenários E e F |
| Mudança grande ou antes do evento | Tudo |

**Execução**
- Cada cenário começa com **Limpar tudo** (cabeçalho, 2 cliques).
- Versão aprovada: nenhuma Crítica reprovada e nenhuma regressão sem justificativa em Decisões (`NOTAS.md`).
- Manutenção: IDs nunca são reaproveitados; pergunta que deixa de valer vira "aposentada em vX"; funcionalidade nova ganha pergunta nova; defeito do uso real vira pergunta **antes** da correção.

Severidade: **C** = Crítica (bloqueia) · **I** = Importante · **D** = Desejável
Auto: **N** = `conferir_codigo.js` · **B** = `conferir_navegador.py` · – = só manual

## Categorias

| Prefixo | O que testa |
|---|---|
| FLX | O fluxo principal, do exemplo ao time exportado |
| IMP | Importação: cabeçalhos, normalização, avisos |
| DAD | Não inventa dados: preferência, desafio ou pessoa |
| PIN | Ajuste ao vivo: mover, fixar, recalcular |
| REP | Reprodutibilidade e estabilidade do resultado |
| ROB | Robustez: parâmetro inválido, base grande |
| SES | Sessão e parâmetros salvos |
| FMT | Formato das saídas: CSV, PDF |
| EMB | Visualizador embutido (SharePoint, OneDrive, Teams) |
| PRV | Privacidade |

## Cenário A: exemplo fictício, fluxo completo

**Ficha do caso**

| Campo | Valor |
|---|---|
| Base | Botão **Carregar exemplo fictício** (40 pessoas, 37 no pool, 6 desafios) |
| Parâmetros | Padrão (grupos de 5 a 8, intensidade Padrão, semente vazia) |

**Roteiro**
1. Limpar tudo → Carregar exemplo fictício (2 cliques).
2. Página 1: conferir os KPIs.
3. Página 2 → **Calcular simulação**. Repetir o cálculo 5 vezes, anotando a distribuição (KPI "Grupos") e "Na 1ª opção".
4. Exportar CSV e abrir no Excel. Imprimir / PDF.

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| FLX-01 | C | B | A base carregou inteira? | Página 1: 40 pessoas; KPIs "No pool" = 37 e "Cabeças de chave" = 6 | v1.0.0 |
| FLX-02 | C | N | Os times respeitam o tamanho? | Todo time entre 5 e 8 pessoas, nos 5 cálculos | v1.0.0 |
| FLX-03 | C | N | Alguém ficou fora das 3 opções? | "Fora das opções" = 0, nos 5 cálculos | v1.0.0 |
| FLX-04 | I | N | Cabeça de chave em todo time? | Todo time com 🏅 ≥ 1 | v1.0.0 |
| FLX-05 | I | N | A senioridade está equilibrada? | KPI "Senioridade efetiva (mín–máx)" com diferença ≤ 3 pontos | v1.0.0 |
| FLX-06 | I | N | A distribuição de times é estável? | A mesma distribuição em pelo menos 4 dos 5 cálculos | v1.1.0 |
| FLX-07 | D | N | Quantos ficam na 1ª opção? | Média dos 5 cálculos ≥ 21 (de 33) | v1.1.0 |
| FMT-01 | I | – | O CSV abre bem no Excel? | Acentos corretos, uma coluna por campo, uma linha por pessoa | v1.0.0 |
| FMT-02 | I | – | O PDF sai legível? | Só a página 3; nenhum time quebrado entre páginas; sem a coluna Mover | v1.0.0 |

## Cenário B: exportação do Forms com armadilhas

**Ficha do caso**

| Campo | Valor |
|---|---|
| Desafios | `exemplo/desafios_exemplo.csv` |
| Participantes | `testes/fixtures/forms_armadilhas.csv`: cabeçalho no formato do Forms (ID, horários, "Opção A/B/C", "Cabeça de chave?"…), 26 respostas fictícias com armadilhas plantadas |

**Roteiro**
1. Limpar tudo.
2. Página 0: importar os desafios, depois os participantes (arquivo ou colar o conteúdo).
3. Ler o log; conferir as pessoas citadas na página 1 (use a busca) e os desafios na página 2.

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| IMP-00 | C | N | As colunas "Opção A/B/C" foram lidas? | Página 1 com preferências preenchidas; nenhum aviso de coluna de preferência não encontrada | v1.1.0 |
| IMP-01 | C | N B | Apareceu desafio que não existe? | Página 2 só com D01 a D06 | v1.1.0 |
| IMP-02 | C | N | `D1` virou D01? | Marcos Teles: Pref. 1 = D01 | v1.1.0 |
| IMP-03 | I | N | Vazios ficaram em branco? | Sílvia Rocha só com Pref. 3 = D04; Gisele Matos e Helena Dias sem preferência | v1.1.0 |
| IMP-04 | I | N | Código + descrição e só a descrição foram reconhecidos? | Renata Okada: Pref. 1 = D02; Paulo Viana: Pref. 1 = D04 | v1.0.0 |
| IMP-05 | I | N B | O código inexistente foi avisado? | Log com ⚠ citando D09; Tomás Reis sem Pref. 1 | v1.1.0 |
| IMP-06 | I | N B | A preferência repetida foi tratada? | Log com ⚠ "D03 repetido"; Bia Fonseca sem Pref. 2 | v1.1.0 |
| IMP-07 | I | N B | O nome repetido foi avisado? | Log com ⚠ "Laura Mendes (linhas 2 e 23)" | v1.1.0 |
| IMP-08 | I | N | Nível, gênero e disponibilidade foram normalizados? | Paulo Viana = Senior e "A confirmar"; Otávio Lins = Pleno, com aviso; Alex Moura sem sexo e 50% | v1.0.0 |
| IMP-09 | I | N | O perfil é por pessoa? | Área "Dados": Bia Fonseca DS e Igor Prado DE | v1.1.0 |
| IMP-10 | C | N B | Quem é da organização ficou fora? | No pool = 23; Patrícia Gil, Sérgio Valle e Vera Cunha com "Entra nos grupos" = Não | v1.0.0 |
| DAD-01 | C | – | Alguma preferência foi inventada? | Depois de calcular, Gisele Matos e Helena Dias aparecem "Sem pref." | v1.0.0 |

## Cenário C: ajustes ao vivo

**Ficha do caso:** a simulação do Cenário A.

**Roteiro**
1. Página 3: anotar a semente (rodapé).
2. Mover uma pessoa para outro time → **Recalcular**.
3. Página 2: no desafio com 1 time, mover alguém para ele na página 3; depois **Forçar 2** nesse desafio → Calcular.
4. Página 2: informar a semente anotada no passo 1, sem pessoas fixadas (Desafixar todos) → Calcular duas vezes.
5. Página 2: mínimo = 10 com máximo = 8.
6. Carregar uma base de 120 pessoas e 10 desafios (ou duplicar o exemplo) → Calcular.

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| PIN-01 | C | B | A pessoa movida fica onde foi posta? | Fica com 📌 e continua no time escolhido após Recalcular | v1.0.0 |
| PIN-02 | C | N | A fixação sobrevive ao desafio ganhar um time? | No passo 3, a pessoa continua no Time 1 do desafio, com 📌 | v1.1.0 |
| PIN-03 | I | – | "Desafixar todos" limpa as fixações? | Nenhum 📌 aceso | v1.0.0 |
| REP-01 | I | N B | A mesma semente repete o resultado? | Os dois cálculos do passo 4 dão os mesmos times | v1.1.0 |
| ROB-01 | I | N B | Mínimo acima do máximo é aceito? | O máximo passa para 10 | v1.1.0 |
| ROB-02 | I | – | A tela trava com base grande? | Botões desabilitados e mensagem de progresso durante o cálculo; a página responde; termina em menos de 15 s | v1.1.0 |

## Cenário D: sessão

**Roteiro**
1. Depois do Cenário C: **Salvar sessão**. Limpar tudo. **Carregar sessão** com o arquivo salvo.
2. **Exportar só parâmetros**. Limpar tudo. Importar outra base. Carregar os parâmetros.
3. Carregar `testes/fixtures/sessao_v1.0.0.json` (salva pela v1.0.0) → página 3 → Recalcular.

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| SES-01 | C | – | A sessão volta inteira? | Pessoas, parâmetros, times, semente e 📌 iguais aos de antes de salvar | v1.0.0 |
| SES-02 | C | N B | Uma sessão da v1.0.0 ainda abre? | Abre sem erro; 2 pessoas fixadas (D03 e D01 · Time 2) continuam nos mesmos times após Recalcular | v1.1.0 |
| SES-03 | I | – | Os parâmetros carregam sem apagar a base atual? | Mensagem "participantes atuais mantidos"; pesos e tamanhos do arquivo | v1.0.0 |

## Cenário E: visualizador embutido

**Roteiro:** subir o `index.html` no SharePoint ou OneDrive e abrir pelo navegador (ou num canal do Teams). Carregar o exemplo, calcular, exportar CSV e imprimir.

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| EMB-01 | I | B | O app avisa que está embutido? | Faixa amarela de visualizador embutido | v1.0.0 |
| EMB-02 | I | B | A exportação tem alternativa? | Exportar CSV abre "Copiar tabela" | v1.0.0 |
| EMB-03 | I | – | A cópia funciona no Excel de verdade? | Colar no Excel separa as colunas | v1.0.0 |
| EMB-04 | D | – | O relatório formatado cola no Word? | "Copiar relatório formatado" cola com tabelas no Word | v1.0.0 |

## Cenário F: privacidade

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| PRV-01 | C | B | O app faz alguma requisição de rede? | DevTools → Rede: nenhuma requisição além do próprio arquivo, durante todo o Cenário A | v1.0.0 |
| PRV-02 | C | B | "Limpar tudo" apaga os dados? | Recarregar a página volta à página 0, sem pessoas | v1.0.0 |
| PRV-03 | I | N B | Um nome com fórmula vira fórmula no Excel? | Pessoa renomeada para `=HYPERLINK("x")` aparece como texto no CSV aberto no Excel | v1.1.0 |
