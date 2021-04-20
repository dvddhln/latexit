
module.exports.latexParser = function() {
    var HBOX_WARNING_REGEX, LATEX_WARNING_REGEX, LINES_REGEX, LOG_WRAP_LIMIT, LatexParser, LogText, PACKAGE_REGEX, PACKAGE_WARNING_REGEX, state;
    LOG_WRAP_LIMIT = 79;
    LATEX_WARNING_REGEX = /^LaTeX Warning: (.*)$/;
    HBOX_WARNING_REGEX = /^(Over|Under)full \\(v|h)box/;
    PACKAGE_WARNING_REGEX = /^(Package \b.+\b Warning:.*)$/;
    LINES_REGEX = /lines? ([0-9]+)/;
    PACKAGE_REGEX = /^Package (\b.+\b) Warning/;
    LogText = function(text) {

      
      var i, wrappedLines;
      this.text = text.replace(/(\r\n)|\r/g, '\n');
      wrappedLines = this.text.split('\n');
      this.lines = [wrappedLines[0]];
      i = 1;
      while (i < wrappedLines.length) {
        
        if (wrappedLines[i - 1].length === LOG_WRAP_LIMIT && wrappedLines[i - 1].slice(-3) !== '...') {
          this.lines[this.lines.length - 1] += wrappedLines[i];
        } else {
          this.lines.push(wrappedLines[i]);
        }
        i++;
      }
      this.row = 0;
    };
    (function() {
      this.nextLine = function() {
        this.row++;
        if (this.row >= this.lines.length) {
          return false;
        } else {
          return this.lines[this.row];
        }
      };
      this.rewindLine = function() {
        this.row--;
      };
      this.linesUpToNextWhitespaceLine = function() {
        return this.linesUpToNextMatchingLine(/^ *$/);
      };
      this.linesUpToNextMatchingLine = function(match) {
        var lines, nextLine;
        lines = [];
        nextLine = this.nextLine();
        if (nextLine !== false) {
          lines.push(nextLine);
        }
        while (nextLine !== false && !nextLine.match(match) && nextLine !== false) {
          nextLine = this.nextLine();
          if (nextLine !== false) {
            lines.push(nextLine);
          }
        }
        return lines;
      };
    }).call(LogText.prototype);
    state = {
      NORMAL: 0,
      ERROR: 1
    };
    LatexParser = function(text, options) {
     
      this.log = new LogText(text);
      this.state = state.NORMAL;
      options = options || {};
      this.fileBaseNames = options.fileBaseNames || [/compiles/, /\/usr\/local/];
      this.ignoreDuplicates = options.ignoreDuplicates;
      this.data = [];
      this.fileStack = [];
      this.currentFileList = this.rootFileList = [];
      this.openParens = 0;
    };
    (function() {
      this.parse = function() {
        var lineNo;
        while ((this.currentLine = this.log.nextLine()) !== false) {
          if (this.state === state.NORMAL) {
            
            if (this.currentLineIsError()) {
                
              this.state = state.ERROR;
              this.currentError = {
                line: null,
                file: this.currentFilePath,
                level: 'error',
                message: this.currentLine.slice(2),
                content: '',
                raw: this.currentLine + '\n'
              };
            } else if (this.currentLineIsRunawayArgument()) {
              this.parseRunawayArgumentError();
            } else if (this.currentLineIsWarning()) {
              this.parseSingleWarningLine(LATEX_WARNING_REGEX);
            } else if (this.currentLineIsHboxWarning()) {
              this.parseHboxLine();
            } else if (this.currentLineIsPackageWarning()) {
              this.parseMultipleWarningLine();
            } else {
              this.parseParensForFilenames();
            }
          }
          if (this.state === state.ERROR) {

           
            
            this.currentError.content += this.log.linesUpToNextMatchingLine(/^l\.[0-9]+/).join('\n');
            this.currentError.content += '\n';
            this.currentError.content += this.log.linesUpToNextWhitespaceLine().join('\n');
            this.currentError.content += '\n';
            this.currentError.content += this.log.linesUpToNextWhitespaceLine().join('\n');
            this.currentError.raw += this.currentError.content;
            lineNo = this.currentError.raw.match(/l\.([0-9]+)/);
            if (lineNo) {
              this.currentError.line = parseInt(lineNo[1], 10);
            }
            this.data.push(this.currentError);
            this.state = state.NORMAL;
          }
        }
        return this.postProcess(this.data);
      };
      this.currentLineIsError = function() {
        return this.currentLine[0] === '!';
      };
      this.currentLineIsRunawayArgument = function() {
        return this.currentLine.match(/^Runaway argument/);
      };
      this.currentLineIsWarning = function() {
        return !!this.currentLine.match(LATEX_WARNING_REGEX);
      };
      this.currentLineIsPackageWarning = function() {
        return !!this.currentLine.match(PACKAGE_WARNING_REGEX);
      };
      this.currentLineIsHboxWarning = function() {
        return !!this.currentLine.match(HBOX_WARNING_REGEX);
      };
      this.parseRunawayArgumentError = function() {
        var lineNo;
        this.currentError = {
          line: null,
          file: this.currentFilePath,
          level: 'error',
          message: this.currentLine,
          content: '',
          raw: this.currentLine + '\n'
        };
        this.currentError.content += this.log.linesUpToNextWhitespaceLine().join('\n');
        this.currentError.content += '\n';
        this.currentError.content += this.log.linesUpToNextWhitespaceLine().join('\n');
        this.currentError.raw += this.currentError.content;
        lineNo = this.currentError.raw.match(/l\.([0-9]+)/);
        if (lineNo) {
          this.currentError.line = parseInt(lineNo[1], 10);
        }
        return this.data.push(this.currentError);
      };
      this.parseSingleWarningLine = function(prefix_regex) {
        var line, lineMatch, warning, warningMatch;
        warningMatch = this.currentLine.match(prefix_regex);
        if (!warningMatch) {
          return;
        }
        warning = warningMatch[1];
        lineMatch = warning.match(LINES_REGEX);
        line = lineMatch ? parseInt(lineMatch[1], 10) : null;
        this.data.push({
          line: line,
          file: this.currentFilePath,
          level: 'warning',
          message: warning,
          raw: warning
        });
      };
      this.parseMultipleWarningLine = function() {
        var line, lineMatch, packageMatch, packageName, prefixRegex, raw_message, warningMatch, warning_lines;
        warningMatch = this.currentLine.match(PACKAGE_WARNING_REGEX);
        if (!warningMatch) {
          return;
        }
        warning_lines = [warningMatch[1]];
        lineMatch = this.currentLine.match(LINES_REGEX);
        line = lineMatch ? parseInt(lineMatch[1], 10) : null;
        packageMatch = this.currentLine.match(PACKAGE_REGEX);
        packageName = packageMatch[1];
        prefixRegex = new RegExp('(?:\\(' + packageName + '\\))*[\\s]*(.*)', 'i');
        while (!!(this.currentLine = this.log.nextLine())) {
          
          lineMatch = this.currentLine.match(LINES_REGEX);
          line = lineMatch ? parseInt(lineMatch[1], 10) : line;
          warningMatch = this.currentLine.match(prefixRegex);
          warning_lines.push(warningMatch[1]);
        }
        raw_message = warning_lines.join(' ');
        this.data.push({
          line: line,
          file: this.currentFilePath,
          level: 'warning',
          message: raw_message,
          raw: raw_message
        });
      };
      this.parseHboxLine = function() {
        var line, lineMatch;
        lineMatch = this.currentLine.match(LINES_REGEX);
        line = lineMatch ? parseInt(lineMatch[1], 10) : null;
        this.data.push({
          line: line,
          file: this.currentFilePath,
          level: 'typesetting',
          message: this.currentLine,
          raw: this.currentLine
        });
      };
      this.parseParensForFilenames = function() {
        var filePath, newFile, pos, previousFile, token;
        pos = this.currentLine.search(/\(|\)/);
        if (pos !== -1) {
          token = this.currentLine[pos];
          this.currentLine = this.currentLine.slice(pos + 1);
          if (token === '(') {
            filePath = this.consumeFilePath();
            if (filePath) {
              this.currentFilePath = filePath;
              newFile = {
                path: filePath,
                files: []
              };
              this.fileStack.push(newFile);
              this.currentFileList.push(newFile);
              this.currentFileList = newFile.files;
            } else {
              this.openParens++;
            }
          } else if (token === ')') {
            if (this.openParens > 0) {
              this.openParens--;
            } else {
              if (this.fileStack.length > 1) {
                this.fileStack.pop();
                previousFile = this.fileStack[this.fileStack.length - 1];
                this.currentFilePath = previousFile.path;
                this.currentFileList = previousFile.files;
              }
            }
          }
          this.parseParensForFilenames();
        }
      };
      this.consumeFilePath = function() {
        var endOfFilePath, path;
        if (!this.currentLine.match(/^\/?([^ \)]+\/)+/)) {
          return false;
        }
        endOfFilePath = this.currentLine.search(RegExp(' |\\)'));
        path = void 0;
        if (endOfFilePath === -1) {
          path = this.currentLine;
          this.currentLine = '';
        } else {
          path = this.currentLine.slice(0, endOfFilePath);
          this.currentLine = this.currentLine.slice(endOfFilePath);
        }
        return path;
      };
      return this.postProcess = function(data) {
        var all, errors, hashEntry, hashes, i, typesetting, warnings;
        all = [];
        errors = [];
        warnings = [];
        typesetting = [];
        hashes = [];
        hashEntry = function(entry) {
          return entry.raw;
        };
        i = 0;
        while (i < data.length) {
          if (this.ignoreDuplicates && hashes.indexOf(hashEntry(data[i])) > -1) {
            i++;
            continue;
          }
          if (data[i].level === 'error') {
            errors.push(data[i]);
          } else if (data[i].level === 'typesetting') {
            typesetting.push(data[i]);
          } else if (data[i].level === 'warning') {
            warnings.push(data[i]);
          }
          all.push(data[i]);
          hashes.push(hashEntry(data[i]));
          i++;
        }
        return {
          errors: errors,
          warnings: warnings,
          typesetting: typesetting,
          all: all,
          files: this.rootFileList
        };
      };
    }).call(LatexParser.prototype);
    LatexParser.parse = function(text, options) {
      return new LatexParser(text, options).parse();
    };
    return LatexParser;
  };
