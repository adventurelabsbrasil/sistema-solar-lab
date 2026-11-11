"""Gera assets/sky/{stars,constellations}.json a partir de dados abertos.

Fontes (ver assets/ATTRIBUTION.md):
  - HYG Database v4.1 (astronexus) — CC BY-SA 4.0 — Hipparcos + Yale Bright Star + Gliese
  - d3-celestial (Olaf Frohn) — BSD-3-Clause — linhas e nomes das 88 constelações

Uso:  python3 -I scripts/build-sky.py [--cache DIR]
"""
import csv
import io
import json
import os
import sys
import urllib.request

HYG = 'https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv'
LINES = 'https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json'
NAMES = 'https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json'
MAG_LIMIT = 6.5      # limite do olho nu em céu escuro
NAMED_LIMIT = 2.6    # estrelas com nome próprio mostradas como rótulo
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'sky')


def fetch(url, cache):
    path = os.path.join(cache, os.path.basename(url)) if cache else None
    if path and os.path.exists(path):
        return open(path, 'rb').read()
    data = urllib.request.urlopen(url, timeout=120).read()
    if path:
        open(path, 'wb').write(data)
    return data


def main():
    cache = sys.argv[sys.argv.index('--cache') + 1] if '--cache' in sys.argv else None
    if cache:
        os.makedirs(cache, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    stars, named = [], []
    for row in csv.DictReader(io.StringIO(fetch(HYG, cache).decode('utf-8'))):
        if row['id'] == '0':  # o Sol
            continue
        mag = float(row['mag'])
        if mag > MAG_LIMIT:
            continue
        ra, dec = float(row['ra']) * 15.0, float(row['dec'])  # HYG: ra em horas
        ci = float(row['ci']) if row['ci'] not in ('', None) else 0.6
        stars.append([round(ra, 3), round(dec, 3), round(mag, 2), round(ci, 2)])
        if row['proper'] and mag <= NAMED_LIMIT:
            named.append([round(ra, 3), round(dec, 3), round(mag, 2), row['proper']])
    stars.sort(key=lambda s: s[2])  # mais brilhantes primeiro
    named.sort(key=lambda s: s[2])

    json.dump({'epoch': 'J2000', 'cols': ['ra_deg', 'dec_deg', 'mag', 'ci'], 'stars': stars, 'named': named},
              open(os.path.join(OUT, 'stars.json'), 'w'), separators=(',', ':'), ensure_ascii=False)

    lines = json.loads(fetch(LINES, cache))['features']
    names = {f['id']: f for f in json.loads(fetch(NAMES, cache))['features']}
    consts = []
    for f in lines:
        # d3-celestial usa longitude em -180..180; RA em graus = lon mod 360.
        segs = [[[round(lon % 360, 3), round(lat, 3)] for lon, lat in line] for line in f['geometry']['coordinates']]
        meta = names.get(f['id'])
        label = None
        if meta:
            lon, lat = meta['geometry']['coordinates']
            label = [round(lon % 360, 3), round(lat, 3)]
        consts.append({'id': f['id'], 'name': meta['properties']['name'] if meta else f['id'], 'label': label, 'lines': segs})
    json.dump({'epoch': 'J2000', 'constellations': consts},
              open(os.path.join(OUT, 'constellations.json'), 'w'), separators=(',', ':'), ensure_ascii=False)

    print(f'estrelas: {len(stars)} (mag<={MAG_LIMIT}) · nomeadas: {len(named)} · constelações: {len(consts)}')


if __name__ == '__main__':
    main()
