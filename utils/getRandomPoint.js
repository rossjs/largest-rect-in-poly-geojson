const { randomPosition } = require('@turf/random');

// module.exports = function getRandomPoint(extent, boxWidth, boxHeight) {
//   const [minX, minY] = extent;
//   const rndX = Math.random() * boxWidth + minX;
//   const rndY = Math.random() * boxHeight + minY;
//   return [rndX, rndY];
// };

const extent = [
  -74.4703640857396,
  40.5236599240542,
  -74.4693883097344,
  40.5242895548032,
];

const randPoint = randomPosition(extent);
console.log(randPoint);
