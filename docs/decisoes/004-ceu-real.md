# 004 — Céu real

- **Status:** decidido (11/11/2026)

## Decisão

Estrelas do catálogo **HYG v4.1** até magnitude 6,5 (8 920 estrelas) e as 88 constelações do **d3-celestial**, geradas por `scripts/build-sky.py` em `assets/sky/*.json`. Posição por RA/Dec J2000 rotacionada para a eclíptica; cor pelo índice B–V; tamanho e brilho pela magnitude.

## Por quê

- Dados abertos, verificáveis e pequenos (~260 KB).
- Mag 6,5 é o limite do olho nu: o céu fica reconhecível sem pesar.

## Alternativas descartadas

- **Estrelas aleatórias (versão anterior):** decorativas, sem constelações reconhecíveis.
- **Gaia/Tycho completos:** milhões de estrelas, sem ganho visual para o objetivo.

## Riscos aceitos

- Sem paralaxe: estrelas tratadas como infinitamente distantes (correto dentro do sistema solar).
- O arquivo derivado do HYG mantém a licença CC BY-SA 4.0 (ver `assets/sky/LICENSE`).
