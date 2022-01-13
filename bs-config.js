"use strict";
var browserSync = require('browser-sync');

function lessMiddleware (req, res, next) {
    // Adapted directly from Browsersync exampes:
    //   https://github.com/Browsersync/recipes/tree/master/recipes/middleware.css.injection

    var parsed = require("url").parse(req.url);
    if (parsed.pathname.match(/\.less$/)) {
        return less(parsed.pathname).then(function (o) {
            res.setHeader('Content-Type', 'text/css');
            res.end(o.css);
        });
    }
    next();

    function less(src) {
        var f = require('fs').readFileSync('app' + src).toString();
        return require('less').render(f); 
    }
}

// {
//   "port": 8000,
//   "server": {
//     "baseDir": ["./src", "./build/contracts"]
//   }
// }

module.exports = {
  "server": {
    "baseDir": ["./src", "./build/contracts"],
    "middleware": {
      2: lessMiddleware,
    },
  },
  port:8000,
};
