#!/bin/bash
# deploy-leads.sh — Auto-publica o painel de leads da VANT no GitHub Pages
# Uso: ./deploy-leads.sh [/caminho/para/output/RUN_ID]
# Sem argumento: usa o run mais recente automaticamente

set -e

RUN_DIR="${1:-}"
VANT_DIR="$(cd "$(dirname "$0")" && pwd)"
LEADS_PUB_DIR="$VANT_DIR/docs/leads"

if [ -z "$RUN_DIR" ]; then
  RUN_DIR=$(ls -td /Users/macbook/lead-hunter-opensquad/squads/lead-hunter/output/*/ 2>/dev/null | head -1 | sed 's|/$||')
fi

if [ -z "$RUN_DIR" ] || [ ! -d "$RUN_DIR" ]; then
  echo "ERRO: diretório de run não encontrado: $RUN_DIR"; exit 1
fi

RUN_ID=$(basename "$RUN_DIR")
echo "Publicando run: $RUN_ID"

mkdir -p "$LEADS_PUB_DIR/$RUN_ID/v1"
cp "$RUN_DIR/DASHBOARD.html" "$LEADS_PUB_DIR/$RUN_ID/"
cp "$RUN_DIR/v1/"PREMIUM_*.html "$LEADS_PUB_DIR/$RUN_ID/v1/" 2>/dev/null || true

RUNS_LIST=$(ls -d "$LEADS_PUB_DIR"/2*/ 2>/dev/null | xargs -I{} basename {} | sort -r | python3 -c "import sys; runs=sys.stdin.read().strip().split('\n'); print('['+','.join(['\"'+r+'\"' for r in runs if r])+']')")

cat > "$LEADS_PUB_DIR/index.html" <<INDEXEOF
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VANT — Painel de Leads</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0A0A0F;color:#F0F0F5;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}h1{font-size:1.8rem;font-weight:800;letter-spacing:-0.03em}span.accent{color:#6C63FF}.runs{display:flex;flex-direction:column;gap:10px;min-width:320px}a.run{background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 20px;text-decoration:none;color:#F0F0F5;display:flex;justify-content:space-between;align-items:center;transition:border-color .2s}a.run:hover{border-color:#6C63FF}.run-arrow{color:#6C63FF}</style>
</head><body>
<h1>VANT <span class="accent">/</span> Leads</h1>
<div class="runs" id="runs"></div>
<script>const RUNS=$RUNS_LIST;const c=document.getElementById('runs');if(!RUNS.length){c.innerHTML='<p style="color:#5A5A72;font-size:.85rem">Nenhum run publicado ainda.</p>';}RUNS.forEach(r=>{c.innerHTML+=\`<a href="\${r}/DASHBOARD.html" class="run"><span>\${r}</span><span class="run-arrow">→</span></a>\`;});</script>
</body></html>
INDEXEOF

cd "$VANT_DIR"
git add docs/leads/
git commit -m "leads: publicar painel run $RUN_ID"

GITHUB_TOKEN=$(security find-internet-password -s github.com -w 2>/dev/null)
git push "https://FredericoMatsuoka:$GITHUB_TOKEN@github.com/FredericoMatsuoka/VANT.git" main

echo ""
echo "Publicado com sucesso!"
echo "Dashboard: https://fredericomatsuoka.github.io/VANT/leads/$RUN_ID/DASHBOARD.html"
echo "Index:     https://fredericomatsuoka.github.io/VANT/leads/"
