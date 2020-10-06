const getBBox = function (polygon) {
  // Find minimum and maximum x and y -- not using higher-order functions
  // in favor of manually unrolling the loop for maximum comprehensibility
  let minX = 9999;
  let minY = 9999;
  let maxX = -1;
  let maxY = -1;
  for (let i = 0; i < polygon.length; i++) {
    const point = polygon[i];
    if (point.x < minX) {
      minX = point.x;
    }
    if (point.y < minY) {
      minY = point.y;
    }
    if (point.x > maxX) {
      maxX = point.x;
    }
    if (point.y > maxY) {
      maxY = point.y;
    }
  }

  // Check that some data has been passed, otherwise don't return our arbitrary
  // sentinel values but rather all 0s
  if ((maxY == -1) && (maxX == -1)) {
    return {
      x: 0, y: 0, width: 0, height: 0,
    };
  }

  return {
    x: minX,
    y: minY,
    width: (maxX - minX),
    height: (maxY - minY),
  };
};

const debuggingSVG = function (polygon) {
  // debug("checking corner", corner, "in", room.shapeObject.points, "fits?", fits);
  const bbox = getBBox(polygon);
  const gridX = [];
  for (var i = -50; i < (bbox.height + 50); i += 10) {
    gridX.push(i);
  }
  const gridY = [];
  for (i = -50; i < (bbox.width + 50); i += 10) {
    gridY.push(i);
  }

  return `<svg height="${bbox.y + bbox.height}" width="${bbox.x + bbox.width}" version="1.1" xmlns="http://www.w3.org/2000/svg"> ${
    polygon.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" stroke-width="0" fill="red"/>`).join(' ')
    // '<polygon points="' + polygon.map(function(p) { return p.x + ',' + p.y; }).join(" ") + '" style="fill:lime;stroke:purple;stroke-width:1" /> ' +
  }${gridX.map((x) => `<line x1="${bbox.x + x}" y1="0" x2="${bbox.x + x}" y2="${bbox.y + bbox.height}" stroke="grey" stroke-width="0.5"/>`).join(' ')
  }${gridY.map((y) => `<line y1="${bbox.y + y}" x1="0" y2="${bbox.y + y}" x2="${bbox.x + bbox.width}" stroke="grey" stroke-width="0.5"/>`).join(' ')
    // corners.map(function(c) { return '<circle cx="' + c.x + '" cy="' + c.y + '" r="10" stroke-width="0" fill="red" /> '; }).join(' ') +
  }</svg>`;
};

module.exports = debuggingSVG;
