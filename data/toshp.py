from gjf.geojson_fixer import apply_fixes_if_needed
import json
f = open('sa/data/Council_Districts1.geojson', 'r')
print()

fixed_obj = apply_fixes_if_needed(json.loads(f.read()), flip_coords=True)

f2 = open('sa/data/FixedCouncilDistricts.geojson', 'w')
f2.write(json.dumps(fixed_obj, indent=3))

f2.close()
f.close()
