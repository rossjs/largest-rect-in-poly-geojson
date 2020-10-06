module.exports = function getTolerance(extent, inputTolerance = 0.02) {
  const [minX, minY, maxX, maxY] = extent;
  return Math.min(maxX - minX, maxY - minY) * inputTolerance;
};
