const fs = require('fs');
const path = require('path');

const largestRectInPoly = require('./index');

const building = require('./test/data/sample_building.json');

const testPoly = building.geometry.coordinates[0];

const { compareOutput } = largestRectInPoly(testPoly, { nTries: 50, output: 'geojson', compare: true });

const filePath = path.join(__dirname, 'test', 'data', 'output.json');
fs.writeFileSync(filePath, JSON.stringify(compareOutput, null, 2));
