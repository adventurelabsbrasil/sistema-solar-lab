# 003 — Mecânica orbital

- **Status:** decidido (11/11/2026)

## Decisão

Elementos keplerianos médios de J2000 (Standish, JPL, Tabela 1) com a equação de Kepler resolvida por Newton-Raphson. Da tabela só a taxa da longitude média (`Ldot`) é usada na propagação. A Lua usa elementos geocêntricos com precessão do nó e do perigeu: ângulos e taxas de Simon et al. (1994), §3.4 (b.1), no mesmo referencial J2000; a, e e I da NASA Moon Fact Sheet. Os valores são conferidos contra `test/fixtures/lua-elementos.json`, e as posições contra o JPL Horizons em `test/fixtures/horizons-lua.json`. A tabela da JPL está em `test/fixtures/jpl-table1.json` e um teste compara `src/data/bodies.js` com ela.

## Por quê

- Precisão suficiente para visualização (1800–2050), sem efemérides pesadas nem dependências.
- Módulo puro (`src/orbits.js`), testável em Node.
- Usar o `Ldot` da JPL em vez do período de livro: a diferença chega a 0,4° por século em Saturno.

## Limitações aceitas

- Sem as demais taxas secular (a, e, I, ϖ, Ω) nem perturbações planeta–planeta; fora de ~1800–2050 as posições são extrapolação.
- O intervalo navegável é 0001–9999 (UTC), limite do ISO-8601 de 4 dígitos e do `<input datetime-local>`.
- A Lua não tem as perturbações periódicas do Sol (evecção ±1,27°, variação ±0,66°…): erro médio de ~0,9° na posição em relação ao Horizons, estável entre os anos 1000 e 3000.

## Revisão (11/11/2026): referencial da Lua

Os elementos anteriores (Meeus) usavam as taxas do nó e do perigeu referidas ao **equinócio da data** dentro de um modelo em J2000. Com isso, o plano da órbita derivava ~1,4° por século. Contra o Horizons, o erro médio de latitude passava de 0,13° para 0,8° nos anos 1000 e 3000. A troca pelas taxas J2000 de Simon et al. corrige isso. O ⟨a⟩ de Simon (383 397,8 km) foi testado e descartado: como é um elemento osculador médio, subestima a distância em ~1 000 km. O a de 384 400 km da NASA tem viés próximo de zero.

## Alternativas descartadas

- **VSOP87/DE440:** muito mais preciso, mas exige tabelas grandes ou binários. Candidato a uma decisão futura se o laboratório precisar de eclipses.
