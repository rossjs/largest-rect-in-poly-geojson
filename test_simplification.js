const fs = require('fs');
const path = require('path');

const largestRectInPoly = require('./index');

const featCollection = require('./test/data/buildings.json');
const { createPolygon } = require('./utils/geojson');

const { features } = featCollection;

const createRect = (coords) => {
  const simplifiedPoly = largestRectInPoly(coords, { nTries: 20, output: 'geojson' });
  const properties = {
    stroke: '#f90101',
    'stroke-width': 2,
    'stroke-opacity': 1,
    fill: '#ef0b0b',
    'fill-opacity': 0.5,
  };
  const poly = createPolygon(simplifiedPoly, properties);
  featCollection.features.push(poly);
};

let remaining = features.length;

features.forEach(({ geometry }) => {
  console.log(remaining--, 'remaining');
  const { type, coordinates } = geometry;
  if (type === 'Polygon') {
    createRect(coordinates[0]);
  } else if (type === 'MultiPolygon') {
    for (const coords of coordinates) {
      createRect(coords[0]);
    }
  }
});

const filePath = path.join(__dirname, 'test', 'data', 'simplified.json');

fs.writeFileSync(filePath, JSON.stringify(featCollection, null, 2));
