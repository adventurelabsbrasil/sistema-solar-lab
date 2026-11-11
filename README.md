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

- **3 espaciais:** câmera orbital com zoom desde ~0,2% do raio acima da superfície (~13 km na Terra) até 200 UA. Origem flutuante
  (o ponto em foco fica sempre em 0,0,0) e depth buffer logarítmico — sem tremedeira nem clipping
  mesmo a 30 UA do Sol. Clique num rótulo ou botão "Ir para" para voar até o corpo.
- **Tempo:** ◀◀ retrocede, ▶▶ avança, ⏸ pausa; de 1 s/s (tempo real) a 100 anos/s; campo de data
  para saltar a qualquer instante dos anos 0001–9999 (UTC). Espaço pausa. Fora de ~1800–2050 as
  posições são extrapolação (ver limitações).

## Proporções reais

1 unidade de cena = 1 milhão de km. Raios e distâncias são os reais: a Terra aparece como um ponto
a 150 milhões de km do Sol, e só vira esfera quando você chega perto. O painel mostra, por corpo,
"se este corpo tivesse 1 cm de raio, o Sol estaria a X m". Há opção de ampliar os planetas (10×/30×,
só tamanhos — distâncias seguem reais) para visão geral.

## Céu real

8 920 estrelas reais (catálogo HYG, até magnitude 6,5 — o limite do olho nu), posicionadas por
ascensão reta/declinação J2000 e rotacionadas para a eclíptica, com cor pela temperatura (índice
B–V) e tamanho/brilho pela magnitude. As 88 constelações (linhas + nomes) vêm do d3-celestial.
Checkboxes "constelações" e "nomes das estrelas" no painel. Para apontar a câmera:
`?look=84,2` (RA,Dec em graus; Órion) ou `?look=187,-60` (Cruzeiro do Sul). O céu acompanha a
câmera, então o que você vê é o que se veria daquele ponto do sistema solar (paralaxe estelar ignorada).

## Texturas

Procedurais por padrão. Para usar texturas reais da NASA (via Solar System Scope, CC BY 4.0), siga
`assets/textures/README.md` — é só soltar os arquivos na pasta.

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
src/textures.js         texturas procedurais/reais, anéis, estrelas de fallback
src/sky.js              céu real (HYG + constelações)
src/sky-math.js         RA/Dec → eclíptica, cor e brilho estelar (puro)
scripts/build-sky.py    gera assets/sky/*.json a partir de dados abertos
assets/                 dados do céu e atribuições
src/main.js             cena, origem flutuante, voo, tempo, UI
test/orbits.test.js     testes
```

## Limitações (deliberadas)

- Elementos keplerianos médios J2000 (JPL/Standish), sem taxas seculares dos planetas: preciso para
  visualização perto de 1800–2050; deriva em milênios. Sem perturbações planeta-planeta.
- Eixos de rotação: obliquidade correta, mas a direção do polo no espaço é aproximada.
- Texturas procedurais até você adicionar as reais; sem Via Láctea; estrelas sem paralaxe (infinitamente distantes) e só até mag 6,5.
- Anéis sem sombra do planeta; Lua é a única lua.

## Backlog 🅿️

Plutão e planetas-anões, luas de Júpiter/Saturno, cinturão e cometas (Halley), taxas seculares,
Via Láctea, nuvens da Terra, estrelas mais fracas (mag > 6,5), eclipses/alinhamentos como eventos navegáveis.
