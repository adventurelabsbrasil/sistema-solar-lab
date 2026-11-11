# Texturas reais (opcional)

O simulador usa texturas procedurais por padrão. Se os arquivos abaixo existirem nesta pasta, eles
substituem automaticamente a textura de cada corpo (sem mudar código; basta recarregar a página).

**Fonte:** <https://www.solarsystemscope.com/textures/> — baseadas em dados da NASA, licença
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (uso comercial permitido, **com crédito**).
O site não entrega os arquivos para download por script, então o download é manual: abra a página,
baixe as imagens 2K e coloque-as aqui **com estes nomes**:

| Corpo | Arquivo |
|---|---|
| Sol | `2k_sun.jpg` |
| Mercúrio | `2k_mercury.jpg` |
| Vênus | `2k_venus_atmosphere.jpg` |
| Terra | `2k_earth_daymap.jpg` |
| Lua | `2k_moon.jpg` |
| Marte | `2k_mars.jpg` |
| Júpiter | `2k_jupiter.jpg` |
| Saturno | `2k_saturn.jpg` |
| Anéis de Saturno | `2k_saturn_ring_alpha.png` |
| Urano | `2k_uranus.jpg` |
| Netuno | `2k_neptune.jpg` |

Faltou algum? Sem problema: aquele corpo continua procedural. O rodapé do painel mostra quantas
texturas reais foram carregadas. Se publicar o repo com as imagens, mantenha o crédito em
`assets/ATTRIBUTION.md` (já listado).

Quer mais resolução? Baixe as versões 4K/8K e renomeie para os nomes acima (ou ajuste
`TEXTURE_FILES` em `src/textures.js`).
