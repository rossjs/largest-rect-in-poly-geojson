const fs = require('fs');

const largestRectInPoly = require('./index');

const featCollection = require('./test/featureCollection.json');

const { features } = featCollection;

const createRect = (coords) => {
  const { geometry } = largestRectInPoly(coords, { nTries: 20, output: 'geojson' });
    const properties = {
			stroke: "#f90101",
			"stroke-width": 2,
			"stroke-opacity": 1,
			fill: "#ef0b0b",
			"fill-opacity": 0.5
    };
    featCollection.features.push({...geometry, properties})
}

let remaining = features.length;

features.forEach(({ geometry }) => {
  console.log(remaining--, 'remaining')
  const { type, coordinates } = geometry;
  if (type === 'Polygon') {
    createRect(coordinates[0])
  } else if (type === 'MultiPolygon') {
    for (const coords of coordinates) {
      createRect(coords[0])
    }
  }
})


fs.writeFileSync('largest.json', JSON.stringify(featCollection, null, 2));
