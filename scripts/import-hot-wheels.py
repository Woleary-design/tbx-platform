#!/usr/bin/env python3
"""Normalize collectdb's available car identities. Requires Python + PyYAML.
Usage: python scripts/import-hot-wheels.py /path/to/collectdb
The input must be a git checkout; provenance is pinned to its HEAD.
"""
import json, pathlib, subprocess, sys, collections, gzip, base64
import yaml
root = pathlib.Path(sys.argv[1]).resolve()
revision = subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
base = root / 'data/hot-wheels/english'
nodes = {}; memberships = []; conflicts = []; missing = []
for path in sorted(base.glob('*/*.yaml')):
    data = yaml.load(path.read_text(), Loader=yaml.CSafeLoader)
    year = path.parent.name.removeprefix('hw-')
    series = data['name']
    source = f'https://github.com/topvault/collectdb/blob/{revision}/{path.relative_to(root)}'
    def visit(items, group=''):
        for key, item in (items or {}).items():
            if 'referenceOf' in item:
                ref = item['referenceOf']
                memberships.append((str(ref['id']), year, series + group, source))
                continue
            identities = item.get('editions') or ({'default':item['id']} if item.get('id') else {})
            for edition, identity in identities.items():
                if not isinstance(identity,str): raise ValueError('Unexpected identity')
                node = {'item':item,'year':year,'series':series+group,'source':source,'edition':edition}
                if identity in nodes and nodes[identity]['item'] != item: conflicts.append(identity)
                nodes.setdefault(identity,node)
                memberships.append((identity,year,series+group,source))
            for slug, variant in (item.get('variants') or {}).items():
                merged = {**item, **variant, 'variant':{'name':variant.get('name',slug)}}
                merged.pop('variants',None); merged.pop('editions',None)
                identity = variant.get('id')
                if not identity: raise ValueError('Variant missing ID')
                nodes.setdefault(identity,{'item':merged,'year':year,'series':series+group,'source':source,'edition':'variant'})
                memberships.append((identity,year,series+group,source))
    visit(data.get('items'))
    for group in (data.get('additional') or {}).values(): visit(group.get('items'),' · '+group.get('name','Additional'))

def resolve(identity, seen=None):
    seen = set() if seen is None else seen
    if identity in seen: raise ValueError('Reference cycle: '+identity)
    seen.add(identity)
    node = nodes.get(identity)
    if not node: return None
    item = node['item']; parent = item.get('variantOf')
    inherited = resolve(str(parent['id']),seen) if isinstance(parent,dict) and parent.get('id') else None
    details = {**(inherited or {}).get('details',{}), **(item.get('details') or {})}
    return {**(inherited or {}), **item,'details':details}

selected = collections.defaultdict(list)
for identity,year,series,source in memberships:
    selected[identity].append({'year':year,'series':series,'sourceUrl':source})
records = []; skipped_packages = 0
for identity, member in sorted(selected.items()):
    item = resolve(identity)
    if not item:
        missing.append(identity); continue
    details = item.get('details') or {}
    if details.get('includedCastings'):
        skipped_packages += 1; continue
    node = nodes[identity]
    name = item.get('name') or details.get('castingName')
    if not name: missing.append(identity); continue
    member = sorted({(m['year'],m['series'],m['sourceUrl']) for m in member})
    preferred = sorted(member,key=lambda m:(m[0]!=node['year'], 'Case ' in m[1], m[1]))[0]
    number = str(details.get('toolNumber') or '')
    if number.startswith('Toy #') or number in ['—','None']: number = ''
    records.append({'id':identity,'name':str(name),'identifier':number or 'Not recorded','series':preferred[1],
      'year':preferred[0],'variant':str((item.get('variant') or {}).get('name') or 'Not recorded'),
      'language':'English','source':'collectdb','sourceUrl':preferred[2],'sourceRevision':revision,
      'recordSourceUrl':node['source'],'recordSourceRevision':revision,'license':'ODbL-1.0',
      'memberships':[{'year':y,'series':s,'sourceUrl':u} for y,s,u in member]})
records.sort(key=lambda r:(r['name'].lower(),r['year'],r['variant'],r['id']))
result = {'source':'collectdb','license':'ODbL-1.0','licenseUrl':'https://opendatacommons.org/licenses/odbl/1-0/',
 'notice':'Contains information from collectdb, which is made available under the Open Database License (ODbL).',
 'scope':'1968–2026 Hot Wheels car catalogue; partial source coverage; no images or valuations',
 'sourceRevision':revision,'audit':{'records':len(records),'unresolvedIds':sorted(set(missing)),
 'conflictingIds':sorted(set(conflicts)), 'skippedPackagedItems':skipped_packages,
 'missingToyNumbers':sum(r['identifier']=='Not recorded' for r in records),
 'missingVariantLabels':sum(r['variant']=='Not recorded' for r in records),
 'unknownYearEntries':sum(r['year']=='unknown' for r in records)},'records':records}
if conflicts or missing: raise ValueError(json.dumps(result['audit']))
out = pathlib.Path(__file__).resolve().parents[1] / 'lib/atlas/hot-wheels-catalogue.json'
packed = gzip.compress(json.dumps(result,ensure_ascii=False,separators=(',',':')).encode(),mtime=0)
out.write_text(json.dumps({'encoding':'gzip-base64','data':base64.b64encode(packed).decode()},separators=(',',':'))+'\n')
print(json.dumps(result['audit']))
