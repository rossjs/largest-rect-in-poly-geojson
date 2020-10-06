const { default: pointInPoly } = require('@turf/boolean-point-in-polygon');
const { polygon } = require('@turf/helpers');

const squaredDist = (a, b) => {
  const deltax = b[0] - a[0];
  const deltay = b[1] - a[1];
  return deltax * deltax + deltay * deltay;
};

// const rayIntersectsSegment = (p, p1, p2) => {
//   let pSub1 = p[1];
//   const ref = (p1[1] < p2[1]) ? [p1, p2] : [p2, p1];
//   const a = ref[0];
//   const b = ref[1];
//   if (pSub1 === b[1] || pSub1 === a[1]) {
//     pSub1 += Number.MIN_VALUE;
//   }
//   if (pSub1 > b[1] || pSub1 < a[1]) {
//     return false;
//   } if (p[0] > a[0] && p[0] > b[0]) {
//     return false;
//   } if (p[0] < a[0] && p[0] < b[0]) {
//     return true;
//   }
//   const mAB = (b[1] - a[1]) / (b[0] - a[0]);
//   const mAP = (pSub1 - a[1]) / (p[0] - a[0]);
//   return mAP > mAB;
// };

// const pointInPoly = (p, poly) => {
//   let i = -1;
//   const n = poly.length;
//   let a;
//   let b = poly[n - 1];
//   let c = 0;
//   while (++i < n) {
//     a = b;
//     b = poly[i];
//     if (rayIntersectsSegment(p, a, b)) {
//       c++;
//     }
//   }
//   return c % 2 !== 0;
// };

const pointInSegmentBox = (p, p1, q1) => {
  const eps = 1e-9;
  const [px, py] = p;
  if (
    px < Math.min(p1[0], q1[0]) - eps
    || px > Math.max(p1[0], q1[0]) + eps
    || py < Math.min(p1[1], q1[1]) - eps
    || py > Math.max(p1[1], q1[1]) + eps
  ) {
    return false;
  }
  return true;
};

const lineIntersection = (p1, q1, p2, q2) => {
  const eps = 1e-9;
  const dx1 = p1[0] - q1[0];
  const dy1 = p1[1] - q1[1];
  const dx2 = p2[0] - q2[0];
  const dy2 = p2[1] - q2[1];
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < eps) {
    return null;
  }
  const cross1 = p1[0] * q1[1] - p1[1] * q1[0];
  const cross2 = p2[0] * q2[1] - p2[1] * q2[0];
  const px = (cross1 * dx2 - cross2 * dx1) / denom;
  const py = (cross1 * dy2 - cross2 * dy1) / denom;
  return [px, py];
};

const segmentsIntersect = (p1, q1, p2, q2) => {
  const p = lineIntersection(p1, q1, p2, q2);
  if (p == null) {
    return false;
  }
  return pointInSegmentBox(p, p1, q1) && pointInSegmentBox(p, p2, q2);
};

const polyInsidePoly = (polyA, polyB) => {
  let aA;
  let aB;
  let bA = polyA[polyA.length - 1];
  let bB;
  let iA = -1;
  let iB;
  while (++iA < polyA.length) {
    aA = bA;
    bA = polyA[iA];
    iB = -1;
    bB = polyB[polyB.length - 1];
    while (++iB < polyB.length) {
      aB = bB;
      bB = polyB[iB];
      if (segmentsIntersect(aA, bA, aB, bB)) {
        return false;
      }
    }
  }
  const geojsonPoly = polygon([polyB]);
  return pointInPoly(polyA[0], geojsonPoly);
};

const rotatePoint = (p, alpha, origin = [0, 0]) => {
  const xshifted = p[0] - origin[0];
  const yshifted = p[1] - origin[1];
  const cosAlpha = Math.cos(alpha);
  const sinAlpha = Math.sin(alpha);
  return [cosAlpha * xshifted - sinAlpha * yshifted + origin[0], sinAlpha * xshifted + cosAlpha * yshifted + origin[1]];
};

const rotatePoly = (poly, alpha, origin) => {
  let point;
  const results = [];
  for (let j = 0; j < poly.length; j++) {
    point = poly[j];
    results.push(rotatePoint(point, alpha, origin));
  }
  return results;
};

// TODO: describe what this does
const intersectPoints = (poly, origin, alpha) => {
  let a;
  let p;
  let sqDist;
  let minSqDistLeft = Number.MAX_VALUE;
  let minSqDistRight = Number.MAX_VALUE;
  let closestPointLeft = null;
  let closestPointRight = null;
  const eps = 1e-9;
  const [x0, y0] = [origin[0] + eps * Math.cos(alpha), origin[1] + eps * Math.sin(alpha)];
  const shiftedOrigin = [x0 + Math.cos(alpha), y0 + Math.sin(alpha)];
  let idx = 0;
  if (Math.abs(shiftedOrigin[0] - x0) < eps) {
    idx = 1;
  }
  let i = -1;
  const n = poly.length;
  let b = poly[n - 1];
  while (++i < n) {
    a = b;
    b = poly[i];
    p = lineIntersection(origin, shiftedOrigin, a, b);
    if ((p != null) && pointInSegmentBox(p, a, b)) {
      sqDist = squaredDist(origin, p);
      if (p[idx] < origin[idx]) {
        if (sqDist < minSqDistLeft) {
          minSqDistLeft = sqDist;
          closestPointLeft = p;
        }
      } else if (p[idx] > origin[idx]) {
        if (sqDist < minSqDistRight) {
          minSqDistRight = sqDist;
          closestPointRight = p;
        }
      }
    }
  }
  return [closestPointLeft, closestPointRight];
};

exports.squaredDist = squaredDist;
// exports.rayIntersectsSegment = rayIntersectsSegment;
// exports.pointInPoly = pointInPoly;
// exports.pointInSegmentBox = pointInSegmentBox;
// exports.lineIntersection = lineIntersection;
// exports.segmentsIntersect = segmentsIntersect;
exports.polyInsidePoly = polyInsidePoly;
// exports.rotatePoint = rotatePoint;
exports.rotatePoly = rotatePoly;
exports.intersectPoints = intersectPoints;
