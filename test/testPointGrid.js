const fs = require('fs');
const path = require('path');
const { createPoint, createFeatureCollection } = require('../utils/geojson');
const createPointGrid = require('../utils/createPointGrid');
const buildingPoly = require('./data/sample_building.json');

const coords = createPointGrid(buildingPoly, 0.002);

const points = coords.map(createPoint);

const featureCollection = createFeatureCollection(buildingPoly, ...points)

fs.writeFileSync(path.join(__dirname, 'data', 'grid-test.json'), JSON.stringify(featureCollection, null, 2));

