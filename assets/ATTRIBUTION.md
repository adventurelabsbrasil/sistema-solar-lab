# Atribuições dos dados

| Dado | Fonte | Licença |
|---|---|---|
| `assets/sky/stars.json` — 8 920 estrelas até mag 6,5 (RA, Dec, magnitude, índice B–V) | [HYG Database v4.1](https://github.com/astronexus/HYG-Database) (astronexus), compilado de Hipparcos, Yale Bright Star e Gliese | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — `stars.json` é obra derivada e mantém essa licença |
| `assets/sky/constellations.json` — linhas e nomes das 88 constelações | [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn) | BSD-3-Clause |
| Elementos orbitais dos planetas | Standish, JPL — *Keplerian Elements for Approximate Positions of the Major Planets* | Domínio público (NASA/JPL) |
| Elementos orbitais da Lua | Meeus, *Astronomical Algorithms* (valores médios J2000) | — |
| `assets/textures/*` (opcional, não incluídas) | [Solar System Scope](https://www.solarsystemscope.com/textures/), baseadas em dados da NASA | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — exige crédito |

Os arquivos de `assets/sky/` são gerados por `python3 -I scripts/build-sky.py`.
