"""Baixa texturas reais de domínio público/CC do Wikimedia Commons para assets/textures/.

Cada arquivo é buscado pela API do Commons, que informa licença e autor; o script só aceita
licenças que permitem redistribuição (domínio público ou CC BY/CC BY-SA) e gera
assets/textures/CREDITS.md com a procedência de cada imagem.

Identifica-se com User-Agent próprio, como a política da Wikimedia pede (sem spoof).
Redução de tamanho usa `sips` (macOS); sem ele, as imagens ficam no tamanho original.

Uso:  python3 -I scripts/fetch-textures.py [--cache DIR]
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

UA = 'sistema-solar-lab/0.1 (https://github.com/adventurelabsbrasil/sistema-solar-lab; contato@adventurelabs.com.br) python-urllib'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'textures')
MAX_W = 4096  # largura máxima (mapas equirretangulares 2:1)

# id do corpo → título do arquivo no Commons
SOURCES = {
    'mercurio': 'File:Mercury MESSENGER MDIS Basemap BDR Mosaic Global 32ppd.jpg',  # monocromático (BDR)
    'terra': 'File:Blue Marble Next Generation + topography + bathymetry.jpg',
    'lua': 'File:Clementine albedo simp750.jpg',
    'marte': 'File:Mars Viking MDIM21 ClrMosaic 1km.jpg',
    'jupiter': 'File:Jupiter Cylindrical Map - Dec 2000 PIA07782.jpg',
    'saturno': 'File:Saturn map by Askaniy.png',
}
ALLOWED = re.compile(r'^(public domain|cc0|cc by(-sa)? [\d.]+)', re.I)


def api(**params):
    params['format'] = 'json'
    req = urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params), headers={'User-Agent': UA})
    return json.load(urllib.request.urlopen(req, timeout=60))


def plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()


def metadata(title):
    page = next(iter(api(action='query', titles=title, prop='imageinfo', iiprop='url|size|extmetadata')['query']['pages'].values()))
    ii = page['imageinfo'][0]
    em = ii['extmetadata']
    val = lambda k: plain((em.get(k) or {}).get('value', ''))
    return {'url': ii['url'].split('?')[0], 'w': ii['width'], 'h': ii['height'], 'license': val('LicenseShortName'),
            'author': val('Artist'), 'page': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_'))}


def download(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, 'wb') as f:
        shutil.copyfileobj(r, f)


def to_jpeg(src, dest, width):
    """Converte/reduz para JPEG (qualidade 85) com sips; sem sips, só copia se já for JPEG."""
    if shutil.which('sips'):
        h = width // 2
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', '-z', str(h), str(width), src, '--out', dest],
                       check=True, capture_output=True)
    elif src.lower().endswith(('.jpg', '.jpeg')):
        shutil.copy(src, dest)
    else:
        raise SystemExit(f'sips indisponível e {src} não é JPEG')


def main():
    cache = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else '/tmp/ssl_tex_cache'
    os.makedirs(cache, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for body, title in SOURCES.items():
        m = metadata(title)
        if not ALLOWED.match(m['license']):
            print(f'PULADO {body}: licença "{m["license"]}" não permitida')
            continue
        raw = os.path.join(cache, os.path.basename(m['url']))
        if not os.path.exists(raw):
            print(f'baixando {body} ({m["w"]}x{m["h"]}, {m["license"]}) ...')
            download(m['url'], raw)
        width = min(m['w'], MAX_W)
        dest = os.path.join(OUT, f'{body}.jpg')
        to_jpeg(raw, dest, width)
        print(f'  {body}.jpg  {os.path.getsize(dest) / 1e6:.2f} MB  ({width}x{width // 2})')
        rows.append((body, title.removeprefix('File:'), m))

    with open(os.path.join(OUT, 'CREDITS.md'), 'w', encoding='utf-8') as f:
        f.write('# Créditos das texturas\n\nGerado por `scripts/fetch-textures.py` a partir dos metadados do Wikimedia Commons.\n'
                'Imagens reduzidas a no máximo 4096 px de largura e recomprimidas em JPEG.\n\n'
                '| Arquivo | Imagem original | Autor / crédito | Licença |\n|---|---|---|---|\n')
        for body, title, m in rows:
            f.write(f'| `{body}.jpg` | [{title}]({m["page"]}) | {m["author"][:140]} | {m["license"]} |\n')
    print(f'{len(rows)} texturas · créditos em assets/textures/CREDITS.md')


if __name__ == '__main__':
    main()
