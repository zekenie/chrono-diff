import fs from "fs";
import { join } from "path";
import "zx/globals";

export interface SearchResult {
  file: string;
  lines: Array<{ lineNumber: number; line: string }>;
}

export interface SearchOptions {
  wholeWord?: boolean;
  caseSensitive?: boolean;
  regex?: boolean;
}

export default class ProjectSearcher {
  constructor(private readonly path: string) {}

  public search({
    files,
    searchString,
    options = {},
  }: {
    files: string[];
    searchString: string;
    options: SearchOptions;
  }) {
    return search(files, searchString, options);
  }
}

export async function search(
  files: string[],
  searchString: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const searchResults: SearchResult[] = [];

  files.forEach((file) => {
    const fileContent = fs.readFileSync(file, "utf8");
    const matchingLines = findMatchingLines(fileContent, searchString, options);
    if (matchingLines.length > 0) {
      searchResults.push({
        file,
        lines: matchingLines,
      });
    }
  });

  return searchResults;
}

function findMatchingLines(
  fileContents: string,
  searchString: string,
  options: SearchOptions
): Array<{ lineNumber: number; line: string }> {
  if (fileContents.trim() === "") {
    return []; // Skip empty file contents
  }

  const { wholeWord = false, caseSensitive = false, regex = false } = options;

  const lines = fileContents.split("\n");

  const matchingLines: Array<{ lineNumber: number; line: string }> = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let lineToMatch = line;

    if (!caseSensitive) {
      lineToMatch = lineToMatch.toLowerCase();
      searchString = searchString.toLowerCase();
    }

    if (wholeWord) {
      const regexPattern = regex
        ? `\\b${searchString}\\b`
        : `\\b${escapeRegExp(searchString)}\\b`;
      const regexMatcher = new RegExp(regexPattern, "g");
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

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
