# 005 — Texturas

- **Status:** decidido (11/11/2026)

## Decisão

Texturas **reais** de mapas de domínio público (NASA/JPL/USGS) para Mercúrio, Terra, Lua, Marte e Júpiter, e um mosaico CC BY-SA 3.0 para Saturno, baixadas por `scripts/fetch-textures.py` via API do Wikimedia Commons (que informa licença e autor). Sol, Vênus, Urano e Netuno seguem **procedurais**. Cada arquivo é opcional e independente: se faltar ou for inválido, só aquele corpo usa a textura procedural.

## Por quê

- Os servidores da NASA não responderam nos testes e o pacote Solar System Scope entrega HTML a downloads por script; este projeto não contorna esse tipo de proteção. O Commons tem API aberta e licença por arquivo.
- Não existe mapa de superfície redistribuível equivalente para Sol, Vênus (nuvens), Urano e Netuno; inventar um seria falso.
- Imagens limitadas a 4096 px de largura mantêm o repo em ~10 MB.

## Alternativas descartadas

- **Solar System Scope como fonte única:** download só manual (anti-bot) e imagens artísticas, não mapas de missões.
- **Texturas 8K:** pesam dezenas de MB por corpo no histórico do git.
- **Lua em resolução maior (LRO WAC):** não achei uma versão equirretangular redistribuível no Commons; fica a Clementine (1080×540). Candidato a melhoria.
