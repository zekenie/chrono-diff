import fs from "fs";
import "zx/globals";

export default class ProjectSearcher {
  constructor() {}

  search({ files, searchString, options = {} }) {
    return search(files, searchString, options);
  }
}

export async function search(files, searchString, options) {
  const searchResults = [];

  files.forEach((file) => {
    const fileContent = fs.readFileSync(file, "utf8");
    const matchingLines = findMatchingLines(fileContent, searchString, options);

    if (matchingLines.length > 0) {
      console.log("we have matches");
      searchResults.push({
        file,
        lines: matchingLines,
      });
    }
  });

  return searchResults;
}

function findMatchingLines(fileContents, searchString, options) {
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
      const regexPattern = `(${wordBoundary})${escapeRegExp(
        searchString
      )}(${wordBoundary})`;
      const regexMatcher = new RegExp(regexPattern, "g");
      if (lineToMatch.match(regexMatcher)) {
        matchingLines.push({ lineNumber, line });
      }
      // const regexPattern = regex
      //   ? `\\b${searchString}\\b`
      //   : `\\b${escapeRegExp(searchString)}\\b`;
      // const regexMatcher = new RegExp(regexPattern, "g");
      // if (lineToMatch.match(regexMatcher)) {
      //   matchingLines.push({ lineNumber, line });
      // }
    } else {
      if (lineToMatch.includes(searchString)) {
        matchingLines.push({ lineNumber, line });
      }
    }
  });

  return matchingLines;
}

// function escapeRegExp(string) {
//   return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\/@]/g, "\\$&");
}
