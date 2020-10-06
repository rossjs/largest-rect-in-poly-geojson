const { default: pointGrid } = require('@turf/point-grid');
const { default: bbox } = require('@turf/bbox');

module.exports = (polygon, distance, units) => {
  // get extent of the polygon
  const extent = bbox(polygon);
  // set the mask for the point grid so that we only get points within the given polygon
  const options = { mask: polygon };
  // set the units if provided (defaults to 'kilometers')
  if (units) options.units = units;
  // create point grid (outputs a FeatureCollection)
  const grid = pointGrid(extent, distance, options);
  // get coordinates of all points in the input polygon
  const featureCoords = polygon.geometry.coordinates[0];
  // get all the coordinates from the point grid
  const gridCoords = grid.features.map(({ geometry: { coordinates } }) => coordinates);
  // return an array of the coordinates from original poly and point grid
  return [...featureCoords, ...gridCoords];
};
