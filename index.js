const { range } = require('d3-array');
const { polygonArea, polygonCentroid } = require('d3-polygon');
const simplify = require('simplify-js');

const { polygon } = require('@turf/helpers');
const { randomPosition } = require('@turf/random');
const { default: pointInPoly } = require('@turf/boolean-point-in-polygon');
// const pointInPoly = require('@turf/boolean-point-in-polygon');
console.log('pointInPoly', pointInPoly);

const { squaredDist, polyInsidePoly, rotatePoly, intersectPoints } = require('./utils/originalHelpers');
const { createPolygon, createFeatureCollection } = require('./utils/geojson');
const getBoxDimensions = require('./utils/getBoxDimensions');
const getExtent = require('./utils/getExtent');
const getTolerance = require('./utils/getTolerance');

/**
 Return the largest rectangle inside the given polygon.

 @param poly Array of x, y coordinates describing a polygon, in the order in which those points should be drawn.
 @param options Object describing options, including:
 angle Specifies the rotation of the polygon. An angle of zero means that
 the longer side of the polygon (the width) will be aligned with the x axis.
 An angle of +90 and/or -90 means that the longer side of the polygon (the width)
 will be aligned with the y axis. The parameter angle can be
 - a number between -90 and +90 specifying the angle of rotation of the polygon.
 - a string which is parsed to a number
 - an array of numbers, specifying the possible rotations of the polygon
 - unspecified, which means the polygon can have any possible angle

 aspectRatio The ratio between the width and the height of the rectangle,
 i.e. width/height. The parameter aspectRatio can be
 - a number
 - a string which is parsed to a number
 - an array of numbers, specifying the possible aspectRatios of the polygon

 maxAspectRatio Maximum aspect ratio (width/height). Default is 15.
 This should be used if the aspectRatio is not provided.

 nTries The number of randomly drawn points inside the polygon which
 the algorithm explores as possible center points of the maximal rectangle.
 Default value is 20.

 minWidth The minimum width of the rectangle. Default is 0.

 minHeight The minimum height of the rectangle. Default is 0.

 tolerance The simplification tolerance factor. Should be between 0 and 1.
 Default is 0.02. Larger tolerance corresponds to more extensive simplification.

 origin The center point of the rectangle. If specified, the rectangle is
 fixed at that point, otherwise the algorithm optimizes across all possible points.
 The parameter origin can be
 - a two dimensional array specifying the x and y coordinate of the origin
 - an array of two dimensional arrays specifying the the possible center points
 of the maximal rectangle.

 @return [rect, area, events] Array of result data, including:
 rect Object describing the result rectangle, including:
 cx Center X coordinate of the result rectangle
 cy Center Y coordinate of the result rectangle
 width Width of the result rectangle
 height Height of the result rectangle
 angle Angle of the rectangle's axis, in degrees
 area Total area of the result rectangle
 events Array of events that occurred while finding the rectangle
 */
module.exports = function largestRectInPoly(_poly, _options = {}) {
  // copy input geometry so it's not mutated
  let poly = JSON.parse(JSON.stringify(_poly));
  // copy input geometry so it's not mutated
  const options = JSON.parse(JSON.stringify(_options));
  // let aRatio;
  // let aRatios;
  // let angle;
  // let angleRad;
  // let angles;
  // let aspectRatios;
  // let boxHeight;
  // let boxWidth;
  // let centroid;
  // let height;
  // let i;
  // let insidePoly;
  // let j;
  // let k;
  // let l;
  // let left;
  // let len;
  // let len1;
  // let len2;
  // let len3;
  // let m;
  // let maxArea;
  // let maxAspectRatio;
  // let maxHeight;
  // let maxRect;
  // let maxWidth;
  // let minAspectRatio;
  // let minSqDistH;
  // let minSqDistW;
  // let modifOrigins;
  // let origOrigin;
  // let origin;
  // let origins;
  // let p;
  // let p1H;
  // let p1W;
  // let p2H;
  // let p2W;
  // let rectPoly;
  // let ref2;
  // let ref3;
  // let ref4;
  // let ref5;
  // let ref6;
  // let ref7;
  // let ref8;
  // let right;
  // let rndPoint;
  // let rndX;
  // let rndY;
  // let width;
  // let widthStep;
  // let x0;
  // let y0;

  // fail if not actually a polygon
  if (poly.length < 3) return null;

  const events = [];
  const aspectRatioStep = 0.1;
  const angleStep = 0.1;

  // const defaults = {
  //   maxAspectRatio: 15,
  //   minWidth: 0,
  //   minHeight: 0,
  //   tolerance: 0.02,
  //   nTries: 20,
  //   angles: range(-90, 90 + angleStep, angleStep),
  //   origins: [],
  // };

  if (!options.maxAspectRatio) options.maxAspectRatio = 15;
  if (!options.minWidth) options.minWidth = 0;
  if (!options.minHeight) options.minHeight = 0;
  if (!options.nTries) options.nTries = 20;

  let angles = range(-90, 90 + angleStep, angleStep);
  if (options.angle != null) {
    if (options.angle instanceof Array) {
      angles = options.angle;
    } else if (typeof options.angle === 'number') {
      angles = [options.angle];
    } else if (typeof options.angle === 'string' && !isNaN(options.angle)) {
      angles = [Number(options.angle)];
    }
  }

  let aspectRatios;
  if (options.aspectRatio != null) {
    if (options.aspectRatio instanceof Array) {
      aspectRatios = options.aspectRatio;
    } else if (typeof options.aspectRatio === 'number') {
      aspectRatios = [options.aspectRatio];
    } else if (typeof options.aspectRatio === 'string' && !isNaN(options.aspectRatio)) {
      aspectRatios = [Number(options.aspectRatio)];
    }
  }

  let origins;
  if (options.origin !== undefined) {
    if (options.origin instanceof Array) {
      if (options.origin[0] instanceof Array) {
        origins = options.origin;
      } else {
        origins = [options.origin];
      }
    }
  }

  const extent = getExtent(poly);
  // const [minX, minY, maxX, maxY] = extent;

  const area = Math.abs(polygonArea(poly));
  // fail if polygon of no area
  if (area === 0) throw new Error('Input polygon has no area');

  const tolerance = getTolerance(extent);

  // simplify input polygon
  if (tolerance > 0) {
    // convert coordinates from [ x, y ] format to { x, y } format
    const coords = poly.map(([x, y]) => ({ x, y }));
    // simplify and convert back to [ x, y ] format
    poly = simplify(coords, tolerance).map(({ x, y }) => [x, y]);
  }

  // if in debug mode, push simplify event
  if (options.vdebug) events.push({ type: 'simplify', poly });

  const { boxWidth, boxHeight } = getBoxDimensions(extent);

  const widthStep = Math.min(boxWidth, boxHeight) / 50;

  // if no origins are provided, create nTries random points + centroid if within polygon
  if (origins === undefined) {
    origins = [];
    // get centroid and push to origins array if in poly
    // ? not sure if this is just assumed to have a higher chance of working or not
    const centroid = polygonCentroid(poly);
    const geojsonPoly = polygon([poly]);

    // if centroid is within polygon
    if (pointInPoly(centroid, geojsonPoly)) origins.push(centroid);
    // if (pointInPoly(centroid, poly)) origins.push(centroid);
    while (origins.length < options.nTries) {
      const randomPoint = randomPosition(extent);
      if (pointInPoly(randomPoint, geojsonPoly)) origins.push(randomPoint);
    }
  }

  if (options.vdebug) events.push({ type: 'origins', points: origins });

  let maxArea = 0;
  let maxRect = null;

  // ! HERE'S THE BREAD AND BUTTER

  for (let j = 0; j < angles.length; j++) {
    const angle = angles[j];
    const angleRad = (-angle * Math.PI) / 180;
    if (options.vdebug) events.push({ type: 'angle', angle });
    for (let i = 0; i < origins.length; i++) {
      const origOrigin = origins[i];
      const ref5 = intersectPoints(poly, origOrigin, angleRad);
      let p1W = ref5[0];
      let p2W = ref5[1];
      const ref6 = intersectPoints(poly, origOrigin, angleRad + Math.PI / 2);
      let p1H = ref6[0];
      let p2H = ref6[1];
      const modifOrigins = [];
      if ((p1W != null) && (p2W != null)) {
        modifOrigins.push([(p1W[0] + p2W[0]) / 2, (p1W[1] + p2W[1]) / 2]);
      }
      if ((p1H != null) && (p2H != null)) {
        modifOrigins.push([(p1H[0] + p2H[0]) / 2, (p1H[1] + p2H[1]) / 2]);
      }

      if (options.vdebug) events.push({ type: 'modifOrigin', idx: i, p1W, p2W, p1H, p2H, modifOrigins });

      for (let l = 0; l < modifOrigins.length; l++) {
        origin = modifOrigins[l];
        if (options.vdebug) {
          events.push({
            type: 'origin',
            cx: origin[0],
            cy: origin[1],
          });
        }
        ref7 = intersectPoints(poly, origin, angleRad), p1W = ref7[0], p2W = ref7[1];
        if (p1W === null || p2W === null) {
          continue;
        }
        minSqDistW = Math.min(squaredDist(origin, p1W), squaredDist(origin, p2W));
        maxWidth = 2 * Math.sqrt(minSqDistW);
        ref8 = intersectPoints(poly, origin, angleRad + Math.PI / 2), p1H = ref8[0], p2H = ref8[1];
        if (p1H === null || p2H === null) {
          continue;
        }
        minSqDistH = Math.min(squaredDist(origin, p1H), squaredDist(origin, p2H));
        maxHeight = 2 * Math.sqrt(minSqDistH);
        if (maxWidth * maxHeight < maxArea) {
          continue;
        }
        if (aspectRatios != null) {
          aRatios = aspectRatios;
        } else {
          minAspectRatio = Math.max(1, options.minWidth / maxHeight, maxArea / (maxHeight * maxHeight));
          maxAspectRatio = Math.min(options.maxAspectRatio, maxWidth / options.minHeight, (maxWidth * maxWidth) / maxArea);
          aRatios = range(minAspectRatio, maxAspectRatio + aspectRatioStep, aspectRatioStep);
        }
        for (m = 0, len3 = aRatios.length; m < len3; m++) {
          aRatio = aRatios[m];
          left = Math.max(options.minWidth, Math.sqrt(maxArea * aRatio));
          right = Math.min(maxWidth, maxHeight * aRatio);
          if (right * maxHeight < maxArea) {
            continue;
          }
          if ((right - left) >= widthStep) {
            if (options.vdebug) {
              events.push({
                type: 'aRatio',
                aRatio,
              });
            }
          }
          while ((right - left) >= widthStep) {
            width = (left + right) / 2;
            height = width / aRatio;
            x0 = origin[0], y0 = origin[1];
            rectPoly = [[x0 - width / 2, y0 - height / 2], [x0 + width / 2, y0 - height / 2], [x0 + width / 2, y0 + height / 2], [x0 - width / 2, y0 + height / 2]];
            rectPoly = rotatePoly(rectPoly, angleRad, origin);
            if (polyInsidePoly(rectPoly, poly)) {
              insidePoly = true;
              maxArea = width * height;
              maxRect = {
                cx: x0,
                cy: y0,
                width,
                height,
                angle,
                geometry: [...rectPoly, rectPoly[0]],
              };
              left = width;
            } else {
              insidePoly = false;
              right = width;
            }
            if (options.vdebug) {
              events.push({
                type: 'rectangle',
                cx: x0,
                cy: y0,
                width,
                height,
                areaFraction: (width * height) / area,
                angle,
                insidePoly,
              });
            }
          }
        }
      }
    }
  }

  const result = { area: maxArea, ...maxRect };

  if (options.output === 'geojson') {
    result.geometry = createPolygon(maxRect.geometry);
  }

  if (options.compare) {
    const inputPolygon = createPolygon(poly);
    const highlightStyles = {
      stroke: '#f90101',
      'stroke-width': 2,
      'stroke-opacity': 1,
      fill: '#ef0b0b',
      'fill-opacity': 0.5,
    };

    const highlightedPolygon = createPolygon(maxRect.geometry, highlightStyles);
    result.compareOutput = createFeatureCollection(inputPolygon, highlightedPolygon);
  }

  return result;
};
