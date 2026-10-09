import { geoArea } from 'd3';

/**
 * DataV 等来源的 GeoJSON 遵循 RFC 7946「右手法则」（外环逆时针），
 * 而 d3-geo 在球面上要求外环顺时针，否则多边形会被解释为"地球减去该区域"。
 * 这里逐个多边形检测面积，若大于半球则反转其所有环。
 */
export function rewindGeoJSON(fc) {
  const fix = (rings) =>
    geoArea({ type: 'Polygon', coordinates: rings }) > 2 * Math.PI ? rings.map((r) => [...r].reverse()) : rings;
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') g.coordinates = fix(g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(fix);
  }
  return fc;
}
