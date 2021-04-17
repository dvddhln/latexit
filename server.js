const express = require("express");
const parser = require("./src/latex/latex-log-parser");
const fileupload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || 8080;
const latex = require("node-latex");
const { join, resolve } = require("path");
const { compileTex } = require("./src/latex/tex-compiler.js");
var cors = require("cors");
var fs = require("fs");
var path = require("path");
var temp = require("temp");

app.use(cors());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.post("/upload", function (req, res) {
  const options = {
    inputs: [resolve(join(__dirname, "/"))],
    cmd: "xelatex",
    passes: 2,
  };

  res.setHeader("Content-Type", "application/pdf");

  let buf = new Buffer(req.body.foo.toString("utf8"), "base64");
  let text = buf.toString();

  const pdf = latex(text, options);

  pdf.pipe(res);
  pdf.on("error", (err) => {
    console.log(err.message);
    res.removeHeader("Content-Type");
    res.status(400).send(JSON.stringify({ error: err.message }));
  });
  pdf.on("finish", () => {});
});

app.post("/compile", function (req, res) {
  try {
    let buf = new Buffer(req.body.foo.toString("utf8"), "base64");
    var uid = "tempfile";
    var name = uid + ".tex";

    const data = [];
    const path = temp.mkdirSync("compile");

    fs.writeFileSync(path + "/" + name, buf.toString("utf8"));

    compileTex(path + "/" + name, "pdflatex")
      .catch((error) => {})
      .then(function (results) {
        const start = async () => {
          const stream = fs.readFileSync(path + "/" + uid + ".log", {
            encoding: "utf8",
          });

          let result = parser.latexParser().parse(stream, { ignoreDuplicates: true });

          if (result.errors.length > 0) {
            result.errors.forEach(function (item, index) {
              data.push({
                row: --item.line,
                text: item.message,
                type: item.level,
              });
            });
          }
        };

        start().then(function (results) {
          console.log(data);
          removeDir(path);
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(JSON.stringify(data));
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify(err));
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

var removeDir = function (dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  var list = fs.readdirSync(dirPath);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dirPath, list[i]);
    var stat = fs.statSync(filename);
    console.log("removing: " + filename);
    if (filename == "." || filename == "..") {
      // do nothing for current and parent dir
    } else if (stat.isDirectory()) {
      removeDir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  console.log("removing: " + dirPath);
  fs.rmdirSync(dirPath);
};
