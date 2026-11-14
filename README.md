# Kit de apps de um arquivo 🧩

Ferramentas pequenas para o trabalho, cada uma num **único arquivo HTML**. Você baixa, dá dois cliques e usa: sem instalar nada, sem servidor, sem conta, e **sem nenhum dado sair do seu computador**.

## Apps

| App | O que faz | Versão |
|---|---|---|
| [Montador de times de hackathon](hackathon-team-builder/) | Forma os times de um hackathon a partir das preferências de desafio dos participantes, equilibrando senioridade, cabeças de chave, perfis e gênero | 1.1.0 |

## Nunca usou GitHub? Comece aqui

Você não precisa de conta, de git nem de programar.

1. Clique no nome do app na tabela acima. A pasta dele tem as instruções, logo abaixo da lista de arquivos.
2. Clique no arquivo **`index.html`** e depois no botão de download (a seta para baixo, no canto direito, acima do conteúdo).
3. Dê dois cliques no arquivo baixado. Ele abre no navegador.
4. Cada app tem um botão **Carregar exemplo fictício**, para você testar antes de usar os seus dados.

Para baixar tudo de uma vez: nesta página, botão verde **<> Code** → **Download ZIP**.

> **Dica:** abra o arquivo direto no navegador. Visualizadores embutidos (SharePoint, OneDrive, Teams) bloqueiam download, impressão e o salvamento automático. O app avisa quando isso acontece e oferece **Copiar** como alternativa.

## O que todo app daqui segue

1. **Um arquivo só.** O `index.html` tem tudo: HTML, CSS e JavaScript. Sem build, sem servidor, sem biblioteca baixada da internet.
2. **Nenhum dado sai do navegador.** Os dados ficam no próprio navegador e nos arquivos que você exportar. O app não faz requisição de rede.
3. **Exemplo fictício** embutido, num botão, e repetido na pasta `exemplo/`, para testar sem dados reais.
4. **Núcleo separado da tela.** O JavaScript vem em blocos: `<script id="nucleo">` com as regras e os cálculos, sem tocar na página, e `<script id="interface">` com as telas. Assim, um teste automático (`testes/conferir_codigo.js`) confere o mesmo código que roda no navegador.
5. **Testado como produto:** cada app tem perguntas de controle, uma matriz de resultados por versão e as decisões registradas no `NOTAS.md`.

## Para quem quer criar ou mudar um app

### App novo

1. Crie uma pasta `<app>/` com o `index.html`, um `README.md` e o `NOTAS.md` (modelo em [`modelos/`](modelos/)).
2. Crie `<app>/testes/` com `PERGUNTAS-DE-CONTROLE.md` e `conferir_codigo.js` (modelos em [`modelos/`](modelos/)) e um `RESULTADOS.md`.
3. Acrescente o app na tabela **Apps**.
4. Commit: `<app>: v1.0.0: <o que o app faz>`.

### Nova versão de um app

1. Crie um branch `proposta/<app>-v<versão>`. Altere o `index.html` e suba a constante `VERSION` no bloco `nucleo`.
2. Rode os conferidores (funcionam de qualquer pasta):
   ```
   node <app>/testes/conferir_codigo.js
   python <app>/testes/conferir_navegador.py      (se o app tiver; opcional)
   ```
3. Rode as perguntas de controle conforme a matriz "o que rodar" do app, preencha a coluna da versão em `RESULTADOS.md` e registre o motivo em **Decisões**, no `NOTAS.md`.
4. Abra um pull request. Faça o merge se nenhuma pergunta Crítica foi reprovada e não houve regressão sem justificativa.
5. Atualize a versão na tabela **Apps**.

### Regras

- **Nada de dados reais de pessoas**: nem em exemplos, testes, issues ou pull requests. O `.gitignore` bloqueia `*.csv`, `*.json` e `*.xlsx` fora de `modelos/`, `exemplo/` e `testes/fixtures/`.
- Um commit por versão, com o app e o motivo na mensagem. "update" não conta.
- Todo defeito encontrado no uso real vira pergunta de controle antes de ser corrigido.

## Achou um problema ou tem uma ideia?

Abra uma [issue](https://github.com/diegoborburema/kit-apps-de-um-arquivo/issues): conte o que você fez, o que esperava e o que aconteceu. Precisa de uma conta gratuita no GitHub. Sem conta, me chame no [LinkedIn](https://www.linkedin.com/in/diego-borburema-8721389b).

Também tem agentes de IA para produto em [kit-agentes-de-ia](https://github.com/diegoborburema/kit-agentes-de-ia).

## Licença

[MIT](LICENSE): pode usar, copiar, adaptar e usar no trabalho. Só mantenha o aviso de licença.

<sub>Projeto pessoal. Não representa a visão do meu empregador.</sub>
