# Texturas reais

O simulador usa texturas procedurais por padrão e substitui, corpo a corpo, pelas imagens desta pasta
quando elas existem (procura `<corpo>.jpg`; recarregue a página).

## Já incluídas (baixadas por `scripts/fetch-textures.py`)

| Corpo | Arquivo | Origem | Licença |
|---|---|---|---|
| Mercúrio | `mercurio.jpg` | MESSENGER/MDIS, mosaico monocromático (NASA/JHUAPL/USGS) | domínio público |
| Terra | `terra.jpg` | Blue Marble Next Generation (NASA Earth Observatory) | domínio público |
| Lua | `lua.jpg` | Clementine, albedo (USGS) — baixa resolução (1080×540) | domínio público |
| Marte | `marte.jpg` | Viking MDIM 2.1 colorizado (NASA/JPL/USGS) | domínio público |
| Júpiter | `jupiter.jpg` | Cassini, mapa cilíndrico (NASA/JPL/SSI) | domínio público |
| Saturno | `saturno.jpg` | Mosaico de Askaniy Anpilogov e Björn Jónsson | CC BY-SA 3.0 |

Detalhes e autores por arquivo em [`CREDITS.md`](CREDITS.md). Para baixar de novo:

```bash
python3 -I scripts/fetch-textures.py
```

## Sem textura real (procedurais)

**Sol, Vênus, Urano e Netuno** continuam procedurais: não há mapa de superfície redistribuível
equivalente (Vênus é coberto de nuvens, Urano e Netuno têm pouquíssimo detalhe, e o Sol não vem em
projeção equirretangular). Se quiser, o pacote [Solar System Scope](https://www.solarsystemscope.com/textures/)
(CC BY 4.0, baseado em dados da NASA) tem versões artísticas; o site não entrega arquivos para
download por script, então o download é manual. Coloque aqui, com estes nomes, e o simulador usa:

`sol.jpg` (ou `2k_sun.jpg`) · `venus.jpg` (`2k_venus_atmosphere.jpg`) · `urano.jpg` (`2k_uranus.jpg`) ·
`netuno.jpg` (`2k_neptune.jpg`) · `saturno_aneis.png` (`2k_saturn_ring_alpha.png`)

Mantenha o crédito em [`ATTRIBUTION.md`](../../ATTRIBUTION.md).
