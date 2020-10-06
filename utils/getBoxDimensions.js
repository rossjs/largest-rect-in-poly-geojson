module.exports = function getBoxDimensions(extent) {
  const [minX, minY, maxX, maxY] = extent;
  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  return { boxWidth, boxHeight };
};
