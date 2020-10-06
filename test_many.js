const fs = require('fs');
const path = require('path');

const largestRectInPoly = require('./index');

const featCollection = require('./test/data/buildings.json');

const { features } = featCollection;

const createRect = (coords) => {
  const { geometry } = largestRectInPoly(coords, { nTries: 20, output: 'geojson', tolerance: 0 });
  const properties = {
    stroke: '#f90101',
    'stroke-width': 2,
    'stroke-opacity': 1,
    fill: '#ef0b0b',
    'fill-opacity': 0.5,
  };
  featCollection.features.push({ ...geometry, properties });
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

const filePath = path.join(__dirname, 'test', 'data', 'output.json');
fs.writeFileSync(filePath, JSON.stringify(featCollection, null, 2));
