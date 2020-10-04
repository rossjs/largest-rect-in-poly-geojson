const fs = require('fs');

const largestRectInPoly = require('./index');

const featCollection = require('./test/featureCollection.json');

const testPoly = featCollection.features[0].geometry.coordinates[0];

const { compareOutput } = largestRectInPoly(testPoly, { nTries: 50000, output: 'geojson', compare: true });

fs.writeFileSync('largest.json', JSON.stringify(compareOutput, null, 2));
