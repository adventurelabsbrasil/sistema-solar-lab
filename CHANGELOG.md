# Changelog

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## [0.1.0] — "Primeira Luz" — 2026-11-11

Primeira versão pública.

### Adicionado
- Simulador 3D em **escala real** (1 unidade = 1 milhão de km): Sol, 8 planetas e a Lua, com inclinação, nó orbital, obliquidade, rotação e anéis de Saturno.
- Navegação em **4 dimensões**: câmera orbital com origem flutuante e depth buffer logarítmico (de ~13 km da superfície a 200 UA) e tempo bidirecional (◀◀ ⏸ ▶▶, de 1 s/s a 100 anos/s, datas de 0001 a 9999 UTC).
- Mecânica orbital kepleriana com elementos J2000 da JPL; os 48 elementos dos planetas são conferidos por teste contra a Tabela 1 da JPL. Lua com precessão do nó e do perigeu.
- **Céu real:** 8 920 estrelas (HYG v4.1, até mag 6,5) e as 88 constelações (d3-celestial), com cor pela temperatura e brilho pela magnitude.
- **Texturas reais** de domínio público (Mercúrio, Terra, Lua, Marte, Júpiter) e Saturno em CC BY-SA 3.0, com carga isolada por corpo (uma falha não afeta as demais).
- Painel de controles **ocultável** (`H` / botão ☰) e **modo noturno vermelho** (`N`) com nota explicativa (i).
- Links compartilháveis por query (`foco`, `dist`, `data`, `rate`, `look`, `noturno`, `controles`).
- Scripts reprodutíveis `scripts/build-sky.py` e `scripts/fetch-textures.py`; 22 testes (`node --test`).
- LICENSE MIT, CONTRIBUTING (DCO), ATTRIBUTION e `docs/decisoes/`.

### Limitações conhecidas
- Sol, Vênus, Urano e Netuno usam texturas procedurais; Lua em baixa resolução (1080×540).
- Fora de ~1800–2050 as posições são extrapolação; sem perturbações planeta–planeta.
- Elementos da Lua (Meeus) conferidos só por coerência interna.

[0.1.0]: https://github.com/adventurelabsbrasil/sistema-solar-lab/releases/tag/v0.1.0
