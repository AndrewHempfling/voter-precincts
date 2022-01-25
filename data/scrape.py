from shapely.geometry import Polygon, Point
import requests
import json
import urllib.parse
import pandas as pd
import geopandas as gpd


f = open('sa/data/precinct-codes.json', 'r')
precinctCodes = json.loads(f.read())
print()
print()


distr = requests.get(
    'https://giswebe.tlc.texas.gov/ArcGIS/rest/services/plan_shaded/MapServer/0/query?f=geojson&spatialRel=esriSpatialRelIntersects&where=DistrictFinder%3D%274014_35%27')

distrCoords = distr.json()["features"][0]["geometry"]["coordinates"]
clean_geoms = pd.DataFrame([["Polygon", str(distrCoords)]],
                           columns=["field_geom_type", "field_coords"])
districtPolyData = Polygon(eval(clean_geoms.field_coords.iloc[0])[0])

# print(distrCoords)


precinctURL = "https://giswebe.tlc.texas.gov/ArcGIS/rest/services/Find/MapServer/2/query?f=geojson&outFields=PREC&spatialRel=esriSpatialRelIntersects&where=pctkey" + \
    urllib.parse.quote(" = '294043'")

p = requests.get(precinctURL)
overlaps = {}


def loopPrecinct(precinctText):
    for c in precinctCodes[precinctText]['codes']:
        pCode = str(precinctCodes[precinctText]['prefix'] + c)
        pcodeID = urllib.parse.quote(" = '%s'" % pCode)
        u = "https://giswebe.tlc.texas.gov/ArcGIS/rest/services/Find/MapServer/2/query?f=geojson&outFields=PREC&spatialRel=esriSpatialRelIntersects&where=pctkey%s" % pcodeID
        olap = {}
        try:
            p = requests.get(u)
            pctCrds = p.json()["features"][0]["geometry"]["coordinates"]
            clean_geoms = pd.DataFrame([["Polygon", str(pctCrds)]],
                                       columns=["field_geom_type", "field_coords"])
            dataP = Polygon(eval(clean_geoms.field_coords.iloc[0])[0])
            gdf = gpd.GeoSeries(dataP)
            if dataP.intersects(districtPolyData):
                print(precinctText)
                print('\t'+c)
                olap['code'] = pCode
                olap['success'] = True
                olap['name'] = precinctText
                olap['disp'] = c
                overlaps[precinctText].append(olap)
        except:
            olap['success'] = False
            olap['code'] = pCode
            olap['name'] = precinctText
            olap['disp'] = c


counties = [
    "bexar",
    "comal",
    "bastrop",
    "guadalupe",
    "hays",
    "caldwell",
    "travis"
]

for cn in counties:
    overlaps[cn] = []
    loopPrecinct(cn)

    # print(r.text)
    # print(u)
with open('sa/data/overlapping-precinct-codes.json', 'w') as ff:
    ff.write(json.dumps(overlaps, indent=4))
    ff.close()

print(overlaps)
