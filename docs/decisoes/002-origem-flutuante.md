# 002 — Origem flutuante e depth buffer logarítmico

- **Status:** decidido (11/11/2026)

## Decisão

O ponto em foco fica sempre em (0,0,0): a cada quadro, o grupo `world` é deslocado por `-posição do foco`. O renderer usa `logarithmicDepthBuffer` e planos near/far de 1 km a 10⁶ unidades.

## Por quê

- A câmera precisa ir de ~13 km da superfície da Terra até 200 UA. Com float32 e origem no Sol, a 30 UA a precisão cai a centenas de km e a geometria treme.
- O depth buffer linear não cobre 12 ordens de grandeza sem z-fighting.
- O céu (estrelas e constelações) é desenhado primeiro e sem teste de profundidade, para não depender do buffer logarítmico.

## Alternativas descartadas

- **Várias cenas/câmeras por escala:** complexidade alta e cortes visíveis na transição.
- **Origem fixa no Sol:** tremedeira nos planetas externos.

## Riscos aceitos

- Cada quadro recalcula posições e a elipse da órbita da Lua (360 pontos); custo desprezível, medido só a olho.
