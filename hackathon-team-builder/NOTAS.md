# Hackathon Team Builder: notas

> Tudo o que o código não diz: objetivo, decisões e perguntas em aberto. Este arquivo é editado à mão.

## Objetivo

Dividir as pessoas do evento da área em times, distribuídos pelos problemas (desafios) que vamos resolver. Cada pessoa respondeu um Forms com a 1ª, a 2ª e a 3ª opção de desafio. O app cruza essas respostas com os critérios que considero relevantes (tamanho do time, senioridade, cabeças de chave, perfis, gênero, disponibilidade) e propõe os times. Os ajustes finos são feitos ao vivo, movendo pessoas.

Requisitos que não mudam:
- **Um arquivo HTML, offline**, que abre em qualquer navegador corporativo sem instalar nada.
- **Nenhum dado sai do navegador.** A base tem nome, gênero e senioridade das pessoas.
- **Decisão explicável:** quem pergunta "por que fiquei neste time?" precisa de resposta (preferência atendida, equilíbrio do time, fixação manual).

## Como decide

1. **Quantos times por desafio:** proporcional à demanda (1ª = 3, 2ª = 2, 3ª = 1 ponto), com no máximo `pessoas que citaram o desafio ÷ mínimo do grupo` times. Só troca um time de desafio quando isso melhora o custo em mais de 4%.
2. **Quem vai para cada time:** *simulated annealing* sobre a soma ponderada das 6 regras (tamanho, preferência, senioridade, perfis, ordem de escolha, gênero), com pesos por posição no ranking.
3. **Ajuste humano:** quem é movido fica fixado 📌 e é mantido nos recálculos.

## Decisões

- v1.0.0 (2026-11-13): versão original, feita por mim. Importada sem alterações no repositório de origem.
- v1.1.0 (2026-11-13): revisão com o Claude. Cada item foi reproduzido na v1.0.0 antes de corrigido (Chrome sem janela, exemplo fictício e `testes/fixtures/`):
  - **Colunas "Opção A/B/C" do Forms ignoradas.** Com esse cabeçalho, a v1.0.0 deixava as 23 pessoas "Sem pref." e só avisava "Colunas não encontradas: p1" no log. Agora reconhece Opção A/B/C, 1ª opção, Preferência 1, Primeira escolha etc., e avisa em vermelho quando não há nenhuma coluna de preferência.
  - **Desafios fantasmas.** `D1` (em vez de `D01`), `D09` (inexistente), `-`, `N/A` e `Nenhuma` viravam desafios novos e entravam na demanda: 5 na fixture do Forms. Agora `D1 = D01`, os vazios ficam em branco e, com os desafios importados, o que não bate fica em branco com aviso. Sem desafios importados, as preferências continuam criando os desafios.
  - **Preferência repetida** (`D03;D03;D05`) contava duas vezes na demanda. Agora conta uma, e a importação avisa.
  - **Nome repetido** (resposta duplicada no Forms) passava sem aviso. Agora avisa, com as linhas. Não apaga sozinho, porque podem ser duas pessoas com o mesmo nome.
  - **Perfil por pessoa.** A coluna `Perfil` sobrescrevia o mapeamento da área inteira, e valia a última linha: na fixture, quem era DE na área "Dados" virava DS. Agora o perfil é da pessoa, editável na página 1; vazio segue a área.
  - **Fixação perdida.** O time único de um desafio se chamava `D03`, e o primeiro de vários, `D03#1`. Quando o recálculo dava 2 times ao desafio, o 📌 sumia. Agora a chave é sempre `D03#1`, e sessões antigas são migradas ao carregar.
  - **Mínimo acima do máximo** era aceito ("Automático (5–3)"). Agora o máximo acompanha o mínimo.
  - **Nº de times por desafio mudava a cada clique.** Em 5 cálculos do exemplo, o D03 teve 0, 1 ou 2 times, e as 5 distribuições foram diferentes. A causa: as candidatas eram comparadas por uma otimização curta e ruidosa. As diferenças reais entre elas (até 8%) eram menores que o ruído de cada avaliação (até ±10%, e às vezes o dobro do custo). Agora parte da distribuição proporcional, avalia cada candidata pelo melhor de 3 otimizações com as mesmas sementes e só troca acima de 4% de ganho. No exemplo, 7 de 8 cálculos dão a mesma distribuição, e a média na 1ª opção subiu de 20,6 para 21,8 (de 33). Os parâmetros (3 corridas × 6.000 iterações, 4%) foram escolhidos numa grade sobre o exemplo e uma base sintética de 120 pessoas: 2% ainda oscilava e 6% piorava a base grande.
  - **Semente.** O resultado não era reproduzível. Agora cada cálculo tem semente, mostrada na página 3 e no relatório; a mesma semente com a mesma base e os mesmos parâmetros dá os mesmos times.
  - **Tela travada** por ~8 s com 120 pessoas e 10 desafios. O custo passou a ser incremental (só os 2 times afetados por movimento, mesmo resultado que o cálculo completo) e o cálculo cede a tela, com progresso: ~4 s no mesmo caso.
  - **Exportação para o Excel.** Um nome digitado como `=HYPERLINK(...)` no Forms ia como fórmula. Agora valores que começam com `= + - @` saem com apóstrofo. Todos os textos exibidos passam por escape, e a sessão carregada de arquivo é validada.
  - **Estrutura.** O JavaScript foi separado em 3 blocos (`exemplo`, `nucleo` sem DOM, `interface`), ainda num arquivo único. Assim o `testes/conferir_codigo.js` testa o mesmo código que roda no navegador.
  - Não mudou: telas, fluxo, regras, pesos padrão, pontuações, formato da sessão (salvo a chave dos times) e visual.

## Perguntas em aberto

1. **Cabeçalho real do Forms.** A v1.1.0 reconhece os nomes mais comuns, mas não vi a exportação de verdade. Antes do evento: colar só a linha de cabeçalho (sem respostas) na página 0 e conferir o log. Se a pergunta for de **classificação** (uma coluna só, com `D01;D03;D02`), o app ainda não separa: é a próxima mudança.
2. **Ordem das regras: ponderação ou hierarquia?** Hoje é ponderação: um desequilíbrio grande de senioridade pode, em tese, pesar mais que uma pessoa fora das 3 opções. No exemplo, ninguém fica fora. Se a regra 2 tiver que ser absoluta, dá para trocar por comparação lexicográfica.
3. **Desafio muito procurado sem time.** No exemplo, 1 em cada 8 cálculos ainda sai da distribuição proporcional: por exemplo, D04 (6 pessoas na 1ª opção) fica sem time e D06 (2 na 1ª opção) ganha um. Todos continuam dentro das 3 opções, mas menos gente fica na 1ª. Com os pesos atuais isso é quase um empate, porque "Ordem de escolha" pesa 4 e os equilíbrios pesam 12 a 40. Se os desafios do evento já estão decididos, use **Forçar** na página 2. Se a 1ª opção importa mais que o equilíbrio de perfis e gênero, suba a regra 5 ou o peso dela.
4. **Senioridade por soma.** O equilíbrio é da soma dos pontos do time (capacidade), não da média. Um time maior de juniores pode "equilibrar" com um menor de seniores. É intencional (está no README da v1.0.0, no exemplo do Senior a 50%), mas vale confirmar para o evento.
5. **Importar .xlsx direto.** Ficou de fora: exigiria uma biblioteca embutida no HTML. Continua sendo abrir no Excel e colar.
