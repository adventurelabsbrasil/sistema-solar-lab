# 003 — Mecânica orbital

- **Status:** decidido (11/11/2026)

## Decisão

Elementos keplerianos médios de J2000 (Standish, JPL, Tabela 1) com a equação de Kepler resolvida por Newton-Raphson. Da tabela só a taxa da longitude média (`Ldot`) é usada na propagação. A Lua usa elementos geocêntricos com precessão do nó e do perigeu. A tabela da JPL está em `test/fixtures/jpl-table1.json` e um teste compara `src/data/bodies.js` com ela.

## Por quê

- Precisão suficiente para visualização (1800–2050), sem efemérides pesadas nem dependências.
- Módulo puro (`src/orbits.js`), testável em Node.
- Usar o `Ldot` da JPL em vez do período de livro: a diferença chega a 0,4° por século em Saturno.

## Limitações aceitas

- Sem as demais taxas secular (a, e, I, ϖ, Ω) nem perturbações planeta–planeta; fora de ~1800–2050 as posições são extrapolação.
- O intervalo navegável é 0001–9999 (UTC), limite do ISO-8601 de 4 dígitos e do `<input datetime-local>`.
- Elementos da Lua (Meeus) não conferidos contra a fonte original.

## Alternativas descartadas

- **VSOP87/DE440:** muito mais preciso, mas exige tabelas grandes ou binários. Candidato a uma decisão futura se o laboratório precisar de eclipses.
