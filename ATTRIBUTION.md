# Atribuição

## Céu

Estrelas: [HYG Database v4.1](https://github.com/astronexus/HYG-Database) (astronexus), compilada a partir de Hipparcos, Yale Bright Star Catalog e Gliese. Licença [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). `assets/sky/stars.json` é obra derivada (filtro até magnitude 6,5) e mantém essa licença.

Constelações (linhas e nomes): [d3-celestial](https://github.com/ofrohn/d3-celestial), © 2015 Olaf Frohn, BSD-3-Clause. Texto da licença em `assets/sky/LICENSE`.

## Órbitas e dados físicos

- **Elementos keplerianos dos planetas e taxa da longitude média:** E. M. Standish, [*Keplerian Elements for Approximate Positions of the Major Planets*](https://ssd.jpl.nasa.gov/planets/approx_pos.html), Tabela 1, JPL/Caltech (válidos para 1800–2050). Os valores de `src/data/bodies.js` são conferidos contra uma cópia da tabela em `test/fixtures/jpl-table1.json` (teste automatizado).
- **Raios médios:** [JPL, *Planetary Physical Parameters*](https://ssd.jpl.nasa.gov/planets/phys_par.html). Mercúrio usa 2439,7 km (NASA Planetary Fact Sheet), 0,012% acima do valor JPL (2439,4 km).
- **Rotação e obliquidade:** [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) (conferidos na precisão publicada).
- **Lua:** elementos médios de J. Meeus, *Astronomical Algorithms*; raio 1737,4 km. Estes valores **não** foram conferidos contra a fonte original, apenas por testes de coerência (distância entre perigeu e apogeu, inclinação). Correções são bem-vindas.
- **Sol:** raio nominal IAU 695 700 km.

## Texturas

Mercúrio, Terra, Lua, Marte e Júpiter: imagens de domínio público da NASA/JPL/USGS (MESSENGER, Blue Marble Next Generation, Clementine, Viking, Cassini), obtidas via Wikimedia Commons, reduzidas e recomprimidas. Saturno: mosaico de Askaniy Anpilogov e Björn Jónsson, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) (`assets/textures/saturno.jpg` mantém essa licença). Autores e páginas de origem de cada arquivo em `assets/textures/CREDITS.md`.

Sol, Vênus, Urano e Netuno usam texturas procedurais. Se você adicionar texturas do pacote [Solar System Scope](https://www.solarsystemscope.com/textures/), o crédito exigido pela [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) é: *Solar System Scope textures, CC BY 4.0, based on NASA elevation and imagery data.*

## Biblioteca

Renderização com [three.js](https://threejs.org/) (MIT).

## Assets da comunidade

| Asset | Autor | Licença |
|---|---|---|
| _(nenhum ainda)_ | | |
