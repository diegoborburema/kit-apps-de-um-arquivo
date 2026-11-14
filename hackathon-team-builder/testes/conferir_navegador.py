"""Confere a interface do index.html num Chrome sem janela (opcional; o conferir_codigo.js cobre o núcleo).

Uso (de qualquer pasta):
    pip install playwright        (uma vez; usa o Chrome instalado, ou rode: playwright install chromium)
    python hackathon-team-builder/testes/conferir_navegador.py

O que confere, clicando como uma pessoa faria:
  1. Abre sem erro no console; exemplo fictício carrega 40 pessoas na página 1.
  2. Mínimo acima do máximo na página 2 puxa o máximo junto.
  3. Calcular: página 3 com times, semente no rodapé; mesma semente digitada = mesmos times.
  4. Mover uma pessoa fixa 📌; o recálculo a mantém no time escolhido.
  5. Importar desafios e o Forms com armadilhas pela caixa de colar: avisos de D09, repetido e nome duplicado.
  6. Perfil por pessoa na página 1.
  7. Exportar CSV: download com apóstrofo antes de nome que viraria fórmula.
  8. Carregar a sessão da v1.0.0: fixações mantidas.
  9. Dentro de um iframe (como no SharePoint/Teams): aviso de visualizador embutido e exportação por "Copiar".
 10. "Limpar tudo" apaga os dados do navegador; nenhuma requisição de rede feita pela página em todo o roteiro.
Sai com erro na primeira falha.
"""
import json
import os
import pathlib
import shutil
import sys
import tempfile
import time

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parents[1]
FIX = RAIZ / "testes" / "fixtures"
URL = (RAIZ / "index.html").as_uri()


def ok(msg):
    print("ok  " + msg)


def chrome():
    for c in [os.environ.get("CHROME"), shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chrome")]:
        if c:
            return {"executable_path": c}
    return {}


def estado(page):
    return page.evaluate("() => JSON.parse(localStorage.getItem('hack_team_builder_v1'))")


def calcular(page, semente=""):
    page.click("nav button[data-p=p2]")
    page.fill("#seed", str(semente))
    t = time.time()
    page.click("#btnCalc")
    page.wait_for_selector("#p3.on .gc", timeout=120000)
    page.wait_for_function("() => !document.getElementById('btnCalc').disabled", timeout=120000)
    return time.time() - t


def main():
    erros = []
    with sync_playwright() as pw:
        b = pw.chromium.launch(**chrome())
        ctx = b.new_context(accept_downloads=True)
        page = ctx.new_page()
        page.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: erros.append(str(e)))
        rede = []
        ctx.on("request", lambda r: rede.append(r.url) if not r.url.startswith(("file:", "data:", "blob:")) else None)

        # 1
        page.goto(URL)
        page.click("#btnDemo")
        page.click("#btnDemo")
        page.wait_for_selector("#p1.on")
        n = page.locator("#t1 tr").count() - 1
        assert n == 40, n
        k = page.evaluate("() => Object.fromEntries([...document.querySelectorAll('#k1 .kpi')].map(e => [e.querySelector('span').textContent, e.querySelector('b').textContent]))")
        assert k["No pool dos grupos"] == "37" and k["Cabeças de chave"] == "6", k
        assert not erros, erros
        ok("abre sem erro; exemplo com 40 pessoas, 37 no pool, 6 cabeças de chave")

        # 2
        page.click("nav button[data-p=p2]")
        page.fill("#gmin", "10")
        page.dispatch_event("#gmin", "change")
        assert page.input_value("#gmax") == "10", page.input_value("#gmax")
        page.fill("#gmin", "5")
        page.dispatch_event("#gmin", "change")
        page.fill("#gmax", "8")
        page.dispatch_event("#gmax", "change")
        ok("mínimo 10 puxa o máximo para 10")

        # 3
        seg = calcular(page)
        s = estado(page)
        assert s["seed"] and len(s["groups"]) >= 5, s["groups"]
        assert "Semente:" in page.inner_text("#out")
        sem = s["seed"]
        a1 = s["assign"]
        calcular(page, sem)
        assert estado(page)["assign"] == a1, "mesma semente, times diferentes"
        ok("calcular em %.1f s; %d times; semente %s repetida dá os mesmos times" % (seg, len(s["groups"]), sem))

        # 4
        sel = page.locator("select[data-move]").first
        pid = sel.get_attribute("data-move")
        atual = estado(page)["assign"][pid]
        alvo = [o for o in sel.locator("option").evaluate_all("os => os.map(o => o.value)") if o and o != atual][0]
        sel.select_option(alvo)
        assert estado(page)["pins"][pid] == alvo
        page.click("#btnRecalc")
        page.wait_for_function("() => !document.getElementById('btnRecalc').disabled", timeout=120000)
        s = estado(page)
        assert s["assign"][pid] == alvo and s["pins"][pid] == alvo, (s["assign"][pid], alvo)
        ok("pessoa movida para %s ficou fixada e se manteve no recálculo" % alvo)

        # 5
        page.click("nav button[data-p=p0]")
        page.fill("#pDes", (RAIZ / "exemplo" / "desafios_exemplo.csv").read_text(encoding="utf-8"))
        page.click("#impDes")
        page.fill("#pPeo", (FIX / "forms_armadilhas.csv").read_text(encoding="utf-8"))
        page.click("#impPeo")
        log = page.inner_text("#logPeo")
        assert "23" in log.split("\n")[0], log
        for trecho in ["D09", "D03 repetido", "Laura Mendes (linhas 2 e 23)", "Gerente"]:
            assert trecho in log, trecho
        assert page.locator("#logPeo .warn").count() >= 3
        assert sorted(estado(page)["des"]) == ["D01", "D02", "D03", "D04", "D05", "D06"]
        ok("importação do Forms pela caixa de colar: avisos de D09, repetido, nome duplicado e nível; sem desafio fantasma")

        # 6
        page.click("nav button[data-p=p1]")
        page.fill("#q", "Helena Dias")
        page.select_option("#t1 select[data-k=perfil]", "PM")
        p = [x for x in estado(page)["people"] if x["nome"] == "Helena Dias"][0]
        assert p["perfil"] == "PM", p
        page.fill("#q", "")
        ok("perfil por pessoa editável na página 1")

        # 7
        page.fill("#q", "Laura Mendes")
        page.locator("#t1 input[data-k=nome]").first.fill("=HYPERLINK(\"http://exemplo.invalid\")")
        page.locator("#t1 input[data-k=nome]").first.dispatch_event("change")
        page.fill("#q", "")
        calcular(page)
        with page.expect_download() as dl:
            page.click("#btnCsv")
        csv = pathlib.Path(dl.value.path()).read_text(encoding="utf-8-sig")
        assert "\"'=HYPERLINK(" in csv, csv[:300]
        page.click("#modal [data-close]")
        ok("CSV exportado com apóstrofo antes de =HYPERLINK")

        # 8
        page.click("nav button[data-p=p0]")
        page.set_input_files("#fSess", str(FIX / "sessao_v1.0.0.json"))
        page.wait_for_function("() => document.getElementById('err').textContent.indexOf('Sessão carregada') >= 0")
        pins = estado(page)["pins"]
        assert pins == {"1": "D03#1", "9": "D01#2"}, pins
        page.click("nav button[data-p=p3]")
        assert page.locator(".pin.on").count() == 2
        page.click("#btnRecalc")
        page.wait_for_function("() => !document.getElementById('btnRecalc').disabled", timeout=120000)
        s = estado(page)
        assert s["assign"]["1"] == "D03#1" and s["assign"]["9"] == "D01#2", (s["assign"]["1"], s["assign"]["9"])
        ok("sessão da v1.0.0 carregada; fixações D03#1 e D01#2 mantidas no recálculo")

        # 9
        tmp = pathlib.Path(tempfile.mkdtemp()) / "embutido.html"
        tmp.write_text('<iframe src="%s" style="width:1200px;height:900px"></iframe>' % URL, encoding="utf-8")
        page.goto(tmp.as_uri())
        fr = page.frames[1]
        fr.wait_for_selector("#emb", state="visible")
        fr.click("nav button[data-p=p0]")
        fr.click("#btnDemo")
        fr.click("#btnDemo")
        fr.click("nav button[data-p=p2]")
        fr.click("#btnCalc")
        fr.wait_for_selector("#p3.on .gc", timeout=120000)
        fr.click("#btnCsv")
        fr.wait_for_selector("#modal.on #mCopy")
        assert "Download bloqueado" in fr.inner_text("#modal")
        ok("dentro de iframe: aviso de visualizador embutido e exportação por Copiar")

        # 10
        page.goto(URL)
        page.click("#btnReset")
        page.click("#btnReset")
        page.reload()
        assert estado(page)["people"] == [], "Limpar tudo não apagou as pessoas"
        assert page.locator("#p0.on").count() == 1
        assert not rede, rede
        ok("Limpar tudo apaga os dados; nenhuma requisição de rede da página")

        assert not erros, erros
        b.close()
    print("\nTudo certo.")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print("\nFALHOU: %s" % e)
        sys.exit(1)
