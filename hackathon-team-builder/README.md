# 🧩 Hackathon Team Builder

Ferramenta **100% offline, em um único arquivo HTML**, para formar times de hackathons / data hacks a partir das preferências de desafio dos participantes, equilibrando senioridade, perfis e gênero.

> Nenhum dado sai do navegador. Não há servidor, dependências nem build.

Objetivo, decisões e perguntas em aberto: [`NOTAS.md`](NOTAS.md). Parte do [kit de apps de um arquivo](../README.md), onde estão os padrões que todo app daqui segue.

---

## 🚀 Como usar

1. **Baixe o [`index.html`](index.html)**: clique no arquivo e depois no botão de download (a seta para baixo, no canto direito). Dê dois cliques no arquivo baixado: ele abre no navegador (Edge, Chrome ou Firefox), sem instalar nada.
2. Na página **0 · Dados**:
   - importe os **desafios** (`Codigo;Desafio`). São opcionais: sem esse arquivo, eles são criados a partir das preferências dos participantes;
   - importe os **participantes** por CSV **ou** colando as células direto do Excel (a exportação do Forms aberta no Excel serve);
   - ou clique em **Carregar exemplo fictício** para testar.
3. Leia o **log da importação**. As linhas com ⚠ pedem conferência: preferência que não bate com nenhum desafio, preferência repetida, nome repetido (resposta duplicada no Forms), nível fora da escala.
4. Em **1 · Cadastro**, revise e ajuste a base. Tudo é editável: nível, perfil, cabeça de chave, alocação %, preferências etc.
5. Em **2 · Parâmetros**, defina o tamanho dos grupos, as pontuações, o mapeamento Área → Perfil e a **ordem de prioridade das regras**. Depois clique em **Calcular simulação**.
6. Em **3 · Simulação**, revise os times. Use **Mover** para ajustes ao vivo: quem é movido fica fixado 📌 e é mantido ao recalcular. Exporte em **CSV** ou **PDF**.
7. Use **Salvar sessão (.json)** para retomar depois, ou **Exportar só parâmetros** para reaproveitar a configuração em outro evento.

## 📄 Formato dos arquivos

Delimitador `;`, `,` ou tab (detectado automaticamente). Os cabeçalhos são flexíveis: acentos, maiúsculas e pontuação são ignorados, e há sinônimos aceitos.

**Participantes** (`modelos/modelo_participantes.csv`)

| Coluna | Também aceita | Valores aceitos | Padrão |
|---|---|---|---|
| `Nome` | Nome completo, Participante | texto (obrigatório) | — |
| `Area` | Time, Squad, Departamento | texto livre | `(sem área)` |
| `Senioridade` | Nível, Cargo | Junior / Pleno / Senior (aceita JR, PL, SR, Especialista, Lead) | Pleno, com aviso |
| `Sexo` | Gênero | F / M (aceita Feminino, Masculino); outro valor fica vazio | vazio |
| `Cabeca_de_chave` | Cabeça de chave? | Sim / Não / A confirmar | Não |
| `Entra_nos_grupos` | Participará dos grupos? | Sim / Não | Sim |
| `Alocacao` | Disponibilidade | 0–100, `50%` ou `0,5` | 100 |
| `Pref1`, `Pref2`, `Pref3` | Opção A/B/C, 1ª opção, Preferência 1, Primeira escolha | código do desafio (`D01`, `D1`), `D01 · Descrição` ou só a descrição | vazio |
| `Observacao` | Comentários | texto | vazio |
| `Perfil` *(opcional)* | Papel | PM / DE / DS / Negócio, **por pessoa** | inferido pela área |

Preferências:
- `D1`, `d01` e `D 01` são o mesmo desafio.
- `-`, `N/A`, `Nenhuma`, `Tanto faz` e afins ficam em branco.
- A mesma opção repetida (`D03;D03;D05`) conta uma vez só.
- Com os **desafios já importados**, uma preferência que não corresponde a nenhum deles fica em branco, com aviso. Sem desafios importados, ela cria o desafio (como antes).

**Desafios** (`modelos/modelo_desafios.csv`): `Codigo;Desafio`

## ⚙️ Como o otimizador funciona

Cada regra gera uma penalidade, multiplicada pelo peso da sua posição no ranking. O ranking e os pesos podem ser editados na tela. Pesos padrão:

| # | Regra | Peso |
|---|---|---|
| 1 | Tamanho do grupo dentro de mín–máx | 1000 |
| 2 | Integrante alocado em desafio que escolheu (1ª, 2ª ou 3ª) | 200 |
| 3 | Equilíbrio de senioridade (pontuação efetiva + cabeças de chave) | 40 |
| 4 | Heterogeneidade de perfis (PM, DE, DS, Negócio) | 12 |
| 5 | Ordem de escolha (priorizar 1ª opção) | 4 |
| 6 | Gender balance | 1 |

A ordem é uma **ponderação**, não uma hierarquia estrita: em tese, um desequilíbrio grande de senioridade pode pesar mais que uma pessoa fora das opções. No exemplo fictício isso não acontece (ninguém fica fora das opções).

- **Pontuação de senioridade:** JR = 3, PL = 4, SR = 5, Cabeça de chave = 7 (editável).
- **Alocação %:** multiplica a pontuação e o peso de cabeça de chave. Exemplo: um Senior a 50% soma 2,5, e o otimizador compensa colocando mais gente no grupo.
- **Nº de grupos por desafio:** no modo *Automático*, começa pela distribuição proporcional à demanda ponderada (1ª = 3, 2ª = 2, 3ª = 1 ponto) e só troca grupos entre desafios quando a troca melhora o custo em mais de 4%. Cada distribuição candidata é avaliada pelo melhor de 3 otimizações curtas, com as mesmas sementes para todas. Também é possível forçar um número ou excluir um desafio.
- **Formação dos times:** *simulated annealing* com múltiplos reinícios e custo calculado de forma incremental (só os 2 times afetados por movimento).
- **Semente:** cada cálculo mostra a sua na página 3. A mesma semente, com a mesma base e os mesmos parâmetros, dá exatamente os mesmos times; informe-a em **2 · Parâmetros** para repetir um resultado. Vazio = semente nova a cada cálculo. Fixar pessoas 📌 continua valendo para travar uma versão.

## 🔒 Privacidade

- Os dados ficam **apenas no navegador** (`localStorage`) e nos arquivos que você exportar. **Limpar tudo** apaga o que está no navegador.
- **Não versione dados reais de pessoas.** O `.gitignore` já ignora `*.csv`, `*.json` e `*.xlsx` fora das pastas `modelos/`, `exemplo/` e `testes/fixtures/`.
- O exemplo e as fixtures são **totalmente fictícios**.
- Na exportação para Excel, um valor que começa com `=`, `+`, `-` ou `@` (por exemplo, um nome digitado como fórmula no Forms) sai com apóstrofo na frente, para não virar fórmula.

## ℹ️ Visualizadores embutidos (SharePoint / OneDrive / Teams)

Esses visualizadores bloqueiam downloads, impressão e `localStorage`. A ferramenta detecta isso e oferece **Copiar** (para colar no Excel/Word) como alternativa. Para a experiência completa, abra o arquivo direto no navegador.

**Sem internet:** depois de baixado, o app funciona offline. Ele não faz nenhuma requisição de rede.

## 📁 Estrutura

Nesta pasta:

```
index.html                         ← a aplicação (arquivo único), em 3 blocos:
                                     <script id="exemplo">   dados fictícios do botão "Carregar exemplo"
                                     <script id="nucleo">    regras, importação, otimizador e exportação, sem DOM
                                     <script id="interface"> telas e eventos
NOTAS.md                           ← à mão: objetivo, decisões e perguntas em aberto
modelos/modelo_participantes.csv   ← modelos vazios
modelos/modelo_desafios.csv
exemplo/participantes_exemplo.csv  ← dados fictícios (iguais aos do botão "Carregar exemplo")
exemplo/desafios_exemplo.csv
testes/
  PERGUNTAS-DE-CONTROLE.md         ← cenários para rodar no navegador antes de cada versão
  RESULTADOS.md                    ← matriz de resultados, uma coluna por versão
  conferir_codigo.js               ← confere o núcleo contra as fixtures, sem navegador (Node.js)
  conferir_navegador.py            ← opcional: confere a interface num Chrome sem janela (Playwright)
  fixtures/                        ← entradas de teste, só com dados fictícios
```

O núcleo fica num bloco separado e não toca na página. Assim, o `conferir_codigo.js` testa exatamente o código que roda no navegador, sem cópia.

## 🔁 Nova versão

Segue o fluxo do repositório ([`README.md` da raiz](../README.md#nova-versão-de-um-app)): branch `proposta/hackathon-team-builder-v<versão>`, conferidores, perguntas de controle, pull request e commit `hackathon-team-builder: v<versão>: <motivo>`.

Conferidores (funcionam de qualquer pasta):
```
node hackathon-team-builder/testes/conferir_codigo.js
python hackathon-team-builder/testes/conferir_navegador.py     (opcional)
```

Específico deste app: o exemplo do bloco `exemplo` e os arquivos de `exemplo/` andam juntos. O `conferir_codigo.js` falha se divergirem.
