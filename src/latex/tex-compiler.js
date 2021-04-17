/* Load dependencies */
var Promise = require("bluebird"),
  spawn = require("child_process").spawn,
  path = require("path");
/**
 * Compiles a tex file one or more times.
 *
 * @param {string} file - path to the tex file
 * @param {string} [engine=pdflatex] - which engine to use to compile the file
 * @param {Object[]} runs - An array specifying the runs
 * @param {number} runs[].runs how many times the file should be compiled with the corresponding arguments
 * @param {Object[]} runs[].options arguments used to run the engine
 *
 * @return {Object} a promise for the output file name
 */

function compileTex(file, engine, runs) {
  var parsedFile = path.parse(file),
    outputFile = path.join(
      parsedFile.dir,
      path.basename(file, path.extname(file)) + ".pdf"
    ),
    defaultOptions = ["-interaction=nonstopmode"];
  engine = engine || "pdflatex";

  if (Array.isArray(engine)) {
    runs = engine;
    engine = "pdflatex";
  }

  if (runs === undefined) {
    runs = [
      {
        runs: 1,
        options: defaultOptions.concat(["-draftmode"]),
      },
      {
        runs: 2,
        options: defaultOptions,
      },
    ];
  }

  var optionsForMapping = [];
  runs.map(function (currentValue) {
    for (var i = 0; i < currentValue.runs; i++) {
      optionsForMapping.push(currentValue.options);
    }
  });

  function texPromise(options) {
    if (!Array.isArray(options)) {
      options = options !== undefined ? [options] : defaultOptions;
    }
    options.push(file);

    var texSpawn = spawn(engine, options, { cwd: parsedFile.dir });

    var texPromise = new Promise(function (resolve, reject) {
      var stdrerrMessage = "",
        stdoutMessage = "";
      texSpawn.stderr.on("data", function (data) {
        stdrerrMessage += data.toString();
      });
      texSpawn.stdout.on("data", function (data) {
        stdoutMessage += data.toString();
      });
      texSpawn.on("error", function (data) {
        console.log("error: " + data);
        reject(data);
      });
      texSpawn.on("exit", function (data) {});
      texSpawn.on("close", function (code) {
        resolve(outputFile);
      });
    });
    return texPromise;
  }

  var resultPromise = texPromise(optionsForMapping[0]);

  for (var i = 1; i < optionsForMapping.length; i++) {
    resultPromise = resultPromise.then(function () {
      return texPromise(optionsForMapping[i]);
    });
  }

  return resultPromise;
}

module.exports = { compileTex };
