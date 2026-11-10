# Sistema Solar Lab

Laboratório do sistema solar em **3D + tempo (4 dimensões)**, com **proporções reais** de tamanho e
distância. Roda no browser (Three.js), sem etapa de build.

## Rodar

```bash
npm install        # só instala o three.js
npm start          # http://localhost:8000
npm test           # node --test — mecânica orbital
```

## As 4 dimensões

- **3 espaciais:** câmera orbital com zoom de ~10 km até dezenas de bilhões de km. Origem flutuante
  (o ponto em foco fica sempre em 0,0,0) e depth buffer logarítmico — sem tremedeira nem clipping
  mesmo a 30 UA do Sol. Clique num rótulo ou botão "Ir para" para voar até o corpo.
- **Tempo:** ◀◀ retrocede, ▶▶ avança, ⏸ pausa; de 1 s/s (tempo real) a 100 anos/s; campo de data
  para saltar a qualquer instante (±8 000 anos). Espaço pausa.

## Proporções reais

1 unidade de cena = 1 milhão de km. Raios e distâncias são os reais: a Terra aparece como um ponto
a 150 milhões de km do Sol, e só vira esfera quando você chega perto. O painel mostra, por corpo,
"se este corpo tivesse 1 cm de raio, o Sol estaria a X m". Há opção de ampliar os planetas (10×/30×,
só tamanhos — distâncias seguem reais) para visão geral.

## Corpos

Sol, 8 planetas (com inclinação, nó ascendente, obliquidade do eixo, rotação e anéis de Saturno)
e a Lua (precessão do nó e do perigeu incluída).

## Link direto

`?foco=saturno&dist=0.45&data=2030-06-01T12:00&rate=0` — `foco` (corpo ou `geral`), `dist` (milhões
de km da câmera), `data` (UTC), `rate=0` (pausado).

## Estrutura

```
index.html              UI e import map (three via node_modules)
src/orbits.js           mecânica pura 3D (testável em Node)
src/data/bodies.js      elementos orbitais e dados físicos
src/textures.js         texturas procedurais, estrelas, anéis
src/main.js             cena, origem flutuante, voo, tempo, UI
test/orbits.test.js     testes
```

## Limitações (deliberadas)

- Elementos keplerianos médios J2000 (JPL/Standish), sem taxas seculares dos planetas: preciso para
  visualização perto de 1800–2050; deriva em milênios. Sem perturbações planeta-planeta.
- Eixos de rotação: obliquidade correta, mas a direção do polo no espaço é aproximada.
- Texturas procedurais (sem fotos); estrelas decorativas (não é catálogo real).
- Anéis sem sombra do planeta; Lua é a única lua.

## Backlog 🅿️

Plutão e planetas-anões, luas de Júpiter/Saturno, cinturão e cometas (Halley), taxas seculares,
texturas reais (NASA), catálogo estelar real, eclipses/alinhamentos como eventos navegáveis.
