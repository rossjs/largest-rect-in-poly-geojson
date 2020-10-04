## Largest Rectangle In Polygon

Return the largest rectangle contained in a polygon (now with helpful geojson input/outputs).

Based on [socialtables/largest-rect-in-poly](https://github.com/socialtables/largest-rect-in-poly), which was based on [d3plus](https://github.com/alexandersimoes/d3plus).

Built on [d3](https://github.com/mbostock/d3) and
[simplify-js](https://github.com/mourner/simplify-js).


<!-- ## Table of Contents -->

<!-- ## install -->

<!-- `npm i largest-rect-in-poly` -->

<!-- ```js
const largestRectInPoly = require('largest-rect-in-poly);
``` -->

## API

<b>largestRectInPoly</b>(<i>polygon</i>[, <i>options</i>])



### poly


### options 

```
{
  maxAspectRatio:  , // maximum aspet ratio for rectangle
  minWidth:  , // minimum width for rectangle
  minHeight:  , // maximum height for rectangle
  tolerance:  , //
  nTries: Number, // number of randomized points to run the algorithm on
  angle:  , // required orientation of rectangle (if needed)
  aspectRatio:  , //
  origin:  , //
  output: String, // the output format (only accepts 'geojson' right now)
  compare: Boolean, // whether or not to add highlighted rectangle to geojson output that inlcudes original geometry
}

```

