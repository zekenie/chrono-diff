import fs from "fs";
import "zx/globals";

export default class ProjectSearcher {
  constructor({ readFile }) {
    this.readFile = readFile;
  }

  search({ files, searchString, options = {} }) {
    const searchResults = [];

    files.forEach((file) => {
      const fileContent = this.readFile(file);
      const matchingLines = this.findMatchingLines(
        fileContent,
        searchString,
        options
      );

      if (matchingLines.length > 0) {
        searchResults.push({
          file,
          lines: matchingLines,
        });
      }
    });

    return searchResults;
  }

  findMatchingLines(fileContents, searchString, options) {
    if (fileContents.trim() === "") {
      return []; // Skip empty file contents
    }

    const { wholeWord = false, caseSensitive = false, regex = false } = options;

    const lines = fileContents.split("\n");

    const matchingLines = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      let lineToMatch = line;

      if (!caseSensitive) {
        lineToMatch = lineToMatch.toLowerCase();
        searchString = searchString.toLowerCase();
      }

      if (wholeWord) {
        const wordBoundary = regex ? "\\b" : "\\b|[^\\w]";
        const regexPattern = `(${wordBoundary})${this.escapeRegExp(
          searchString
        )}(${wordBoundary})`;
        const regexMatcher = new RegExp(regexPattern, "g");
        if (lineToMatch.match(regexMatcher)) {
          matchingLines.push({ lineNumber, line });
        }
      } else if (regex) {
        const regexMatcher = new RegExp(searchString, "g");
        if (lineToMatch.match(regexMatcher)) {
          matchingLines.push({ lineNumber, line });
        }
      } else {
        if (lineToMatch.includes(searchString)) {
          matchingLines.push({ lineNumber, line });
        }
      }
    });

    return matchingLines;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\/@]/g, "\\$&");
  }
}
