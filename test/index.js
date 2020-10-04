var should = require("should");
const fs = require('fs');
var findLargestRect = require("../index");
var testPolygons = require("./polygons.json");
var debugSVG = require("./debug-svg");

function makePoint(pair) {
	return {x: pair[0], y: pair[1]};
}

function writeDebug(polygon, rectangle) {
	var svg = debugSVG(polygon.map(makePoint));
	svg = svg.substring(0, svg.length - 6);
	svg += ' <rect x="' + (rectangle.cx - (rectangle.width / 2)) + '" y="' +
		(rectangle.cy - (rectangle.height / 2)) + '" width="' + rectangle.width +
		'" height="' + rectangle.height + '" fill="orange" stroke-width="0" ' +
		'fill-opacity="0.5" transform="rotate(' + rectangle.angle + ' ' + rectangle.cx + ' ' + rectangle.cy + ')" />';
	svg += " </svg>";
	return svg;
}

describe("largest-rect-in-poly", function() {
	it("should find the largest rectangle in a triangle", function(){
		// diffcult to calculate triangles center.
		var polygon = [[0, 0], [0, 30], [40, 0]];
		var result = findLargestRect(polygon);
		should(result).have.property("cx");
		should(result).have.property("cy");
		should(result).have.property("area");
		should(result).have.property("geometry");
		should(result).have.property("width");
		should(result).have.property("height");
		const { area } = result;
		area.should.be.within(240, 300);
	});
	
	it("should find the largest rectangle in a perfect square", function(){
		var polygon = [[0, 0], [0, 1000], [1000, 1000], [1000, 0]];
		var result = findLargestRect(polygon);
		should(result).have.property("cx", 500);
		should(result).have.property("cy", 500);
		const { width, height } = result;
		should(width).be.within(980, 1020);
		should(height).be.within(980, 1020);
	});

	it("should find the largest rectangle in a perfect rectangle", function(){
		var polygon = [[0, 0], [0, 1000], [500, 1000], [500, 0]];
		var result = findLargestRect(polygon);
		should(result).have.property("cx", 250);
		should(result).have.property("cy", 500);
		should(result).have.property("width");
		should(result).have.property("height");
		const { width, height } = result;
		width.should.be.within(990, 1010);
		height.should.be.within(490, 510);
	});

	var variants = [
		{
			polygon: "simple",
			minArea: 855000,
			nTries: 1000,
		}, {
			polygon: "largerRectangle",
			minArea: 230000,
		}, {
			polygon: "medium",
			minArea: 90500,
			nTries: 50,
		}, {
			polygon: "complex",
			minArea: 300500,
			nTries: 50,
		}, {
			polygon: "veryComplex",
			minArea: 21000,
			nTries: 500,
			output: true,
		}
	];

	describe("from polygons.json:", function() {
		variants.forEach(function(v) {
			it("should find the largest rectangle in a " + v.polygon + " polygon", function() {
				var polygon = testPolygons[v.polygon];
				var result = findLargestRect(polygon, { nTries: v.nTries || 20 });
				should(result).have.property("cx");
				should(result).have.property("cy");
				should(result).have.property("width");
				should(result).have.property("height");
				should(result).have.property("area");
				const { area } = result;
				area.should.be.above(v.minArea);
				if(v.output) {
					try {
						fs.openSync('areas.txt', 'wx')
					} catch {}
				// 	fs.writeFile('areas.txt', `${area}\n`, { flag: 'wx' }, function (err) {
				// 		if (err) throw err;
				// 		console.log("It's saved!");
				// });
					fs.appendFileSync('areas.txt', `${area}\n`);
				}
			});
		});
	});
});
