# Sistema Solar Lab

Laboratório do sistema solar: simulação orbital kepleriana dos 8 planetas, rodando no browser,
sem build e sem dependências.

## Rodar

```bash
npm start          # http://localhost:8000  (python3 -m http.server)
npm test           # node --test — testes da mecânica orbital
```

## O que tem

- Posições reais a partir dos elementos orbitais médios J2000 (JPL/Standish), resolvendo a
  equação de Kepler por Newton-Raphson.
- Controle de tempo: pausa, "Hoje", velocidade de 0,1 dia/s a ~11 anos/s.
- Escala de distância comprimida (√r) ou linear real.
- Clique num planeta: distância atual ao Sol (UA e min-luz), periélio/afélio, período, raio.

## Estrutura

```
index.html            UI (canvas + painel)
src/orbits.js         mecânica pura (testável em Node)
src/data/planets.js   elementos orbitais
src/main.js           render e interação
test/orbits.test.js   testes
```

## Limitações (deliberadas)

Aproximação coplanar (ignora inclinação e nó ascendente), sem perturbações, sem luas/asteroides.
Precisão suficiente para visualização (1800–2050), não para efemérides.

## Ideias (backlog)

- Inclinações e nó ascendente (3D com Three.js)
- Luas principais, cinturão de asteroides, cometas (Halley)
- Escala de tamanho real vs. visual
- Alinhamentos/oposições/eclipses como eventos detectados
