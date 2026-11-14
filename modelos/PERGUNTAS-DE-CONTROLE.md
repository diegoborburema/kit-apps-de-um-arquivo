# {{NOME}}: perguntas de controle

Bateria de regressão do app. Cada versão roda a bateria antes do merge, e o resultado entra em `RESULTADOS.md` (uma coluna por versão).

Exemplo completo: [`hackathon-team-builder/testes/`](../hackathon-team-builder/testes/).

## Como usar

**O que rodar depende do que mudou.** Monte uma matriz "parte do app que mudou → cenários a rodar", com o cenário mais curto para mudanças só de texto e tudo para mudanças grandes ou antes de usar de verdade.

| Mudou | Rodar |
|---|---|
| | |

**Execução**
- Cada cenário começa do zero (o botão que limpa os dados do navegador, ou uma janela anônima).
- A coluna **Auto** diz qual conferidor cobre a pergunta: **N** = `conferir_codigo.js` · **B** = `conferir_navegador.py` · – = só manual. O que só uma pessoa vê (Excel, impressão, SharePoint/Teams de verdade) fica no roteiro manual.
- **Versão aprovada:** nenhuma Crítica reprovada e nenhuma regressão sem justificativa em Decisões (`NOTAS.md`).
- **Manutenção:** IDs nunca são reaproveitados; pergunta que deixa de valer vira "aposentada em vX"; funcionalidade nova ganha pergunta nova; defeito do uso real vira pergunta **antes** da correção.

Severidade: **C** = Crítica (bloqueia) · **I** = Importante · **D** = Desejável

## Categorias que quase todo app precisa cobrir

| Prefixo | O que testa | Exemplo de sonda |
|---|---|---|
| FLX | O fluxo principal, do início ao fim | O caminho feliz com o exemplo fictício |
| IMP | Entrada de dados: cabeçalhos, formatos, avisos | A planilha real exportada (Forms, Excel), com erros de digitação |
| DAD | Não inventa nem perde dados | Campo vazio, valor fora da lista |
| ROB | Robustez | Parâmetro inválido, base grande, duplo clique |
| SES | Salvar e retomar | Sessão salva por uma versão anterior |
| FMT | Formato das saídas | CSV no Excel, impressão/PDF |
| EMB | Visualizador embutido | Aberto pelo SharePoint ou pelo Teams |
| PRV | Privacidade | Nenhuma requisição de rede; limpar apaga tudo; texto que vira fórmula no Excel |

## Cenário A: <nome>

**Ficha do caso**

| Campo | Valor |
|---|---|
| | |

**Roteiro**
1. 

| ID | Sev. | Auto | Pergunta | Critério de aprovação | Desde |
|---|---|---|---|---|---|
| FLX-01 | C | | | | v1.0.0 |
