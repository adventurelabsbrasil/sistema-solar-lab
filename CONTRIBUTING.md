# Como contribuir

Contribuições são bem-vindas: código, novos corpos (planetas-anões, luas, cometas), correções de dados, texturas.

## Licenças

| O que você envia | Licença |
|---|---|
| Código | MIT (`LICENSE`) |
| Dados do céu em `assets/sky/` | CC BY-SA 4.0 (estrelas) e BSD-3 (constelações), ver `assets/sky/LICENSE` |
| Texturas em `assets/textures/` | A da fonte (domínio público, CC BY, CC BY-SA), com crédito em `ATTRIBUTION.md` e `assets/textures/CREDITS.md` |

Ao enviar, você concorda que sua contribuição seja publicada sob a licença da camada correspondente.

## DCO: assine seus commits

Usamos o [Developer Certificate of Origin](https://developercertificate.org/). Cada commit precisa da linha `Signed-off-by`, que atesta que você tem direito de enviar aquele conteúdo:

```bash
git commit -s -m "sua mensagem"
```

## Rodar e testar

```bash
npm install
npm test        # mecânica orbital, céu, carregador de texturas (node --test)
npm start       # http://localhost:8000
```

Mexeu em `src/orbits.js`, `src/sky-math.js` ou `src/texture-loader.js`? Adicione ou ajuste um teste em `test/`: são módulos puros, sem DOM, de propósito.

## Regras do projeto

- **Escala real.** Raios e distâncias são os reais. Ampliar só tamanhos, e só como opção visual, nunca distâncias.
- **Dados com fonte.** Todo número astronômico novo cita a fonte (JPL, IAU, catálogo) em `src/data/` ou no PR. Nada de valor "de cabeça": se não achou a fonte, deixe de fora.
- **Sem build.** O projeto roda com `import map` e módulos ES; não adicione bundler sem abrir uma decisão em `docs/decisoes/`.
- **Pipeline reprodutível.** Arquivos de `assets/sky/` são gerados por `scripts/build-sky.py` e as texturas por `scripts/fetch-textures.py`; não edite à mão.
- **Sem assets de licença incompatível.** Texturas só de fontes com licença que permita redistribuição e com o crédito correto.
- **Sem dados pessoais nem credenciais** em commits.

## Decisões de projeto

As decisões ficam em [`docs/decisoes/`](docs/decisoes/).
