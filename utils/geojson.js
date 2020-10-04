exports.createPolygon = (coords, properties = {}) => ({
  type: "Feature",
  properties,
  geometry: {
    type: "Polygon",
    coordinates: [coords]
  }
});

exports.createFeatureCollection = (...args) => ({
  type: "FeatureCollection",
  features: [...args]
});

exports.createPoint = (coordinates) => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "Point",
    coordinates
  }
});
