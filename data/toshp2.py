import json

f = open('sa/data/Texas_US_House_Districts1copy.geojson', 'r')

j = json.loads(f.read())
p = []
for s in j['features']:
    if s["properties"]['DIST_NBR'] == '35':
        p.append(s)
j['features'] = p
ff = open('sa/data/Texas_US_House_Districts1copyjkjnknjjnkjkn.geojson', 'w')
ff.write(json.dumps(j))
ff.close()
f.close()
