import { jest } from "@jest/globals";
import ProjectSearcher from "./code-search.mjs";

const readFile = jest.fn();

describe("search", () => {
  const mockFiles = ["file1.txt", "file2.js", "file3.js", "file4.txt"];

  const mockFileContents = {
    "file1.txt": "This is a sample text file",
    "file2.js": "SomeSearchString is found on this line",
    "file3.js": "This line contains SomeSearchString",
    "file4.txt": "No match here",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when no files are found", async () => {
    const options = {
      wholeWord: true,
      caseSensitive: true,
      regex: false,
    };

    readFile.mockImplementation((file) => {
      return mockFileContents[file];
    });

    const results = new ProjectSearcher({ readFile }).search({
      files: [],
      searchString: "SomeSearchString",
      options,
    });

    expect(results).toEqual([]);
  });

  it("should return an empty array when no matching lines are found", async () => {
    const options = {
      wholeWord: true,
      caseSensitive: true,
      regex: false,
    };

    readFile.mockReturnValue("");

    const results = new ProjectSearcher({ readFile }).search({
      files: mockFiles,
      searchString: "NoMatch",
      options,
    });

    expect(results).toEqual([]);
  });

  it("should return matching lines when files and matching lines are found", async () => {
    const options = {
      wholeWord: true,
      caseSensitive: true,
      regex: false,
    };

    readFile.mockImplementation((file) => {
      return mockFileContents[file];
    });

    const expectedResults = [
      {
        file: "file2.js",
        lines: [
          { lineNumber: 1, line: "SomeSearchString is found on this line" },
        ],
      },
      {
        file: "file3.js",
        lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
      },
    ];

    const results = new ProjectSearcher({ readFile }).search({
      files: mockFiles,
      searchString: "SomeSearchString",
      options,
    });

    expect(results).toEqual(expectedResults);
    expect(readFile).toHaveBeenCalledTimes(mockFiles.length);
  });

  it("should return matching lines as whole words when wholeWord option is enabled", async () => {
    const options = {
      wholeWord: true,
      caseSensitive: false,
      regex: false,
    };

    readFile.mockImplementation((file) => {
      return mockFileContents[file];
    });

    const expectedResults = [
      {
        file: "file2.js",
        lines: [
          { lineNumber: 1, line: "SomeSearchString is found on this line" },
        ],
      },
      {
        file: "file3.js",
        lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
      },
    ];

    const results = new ProjectSearcher({ readFile }).search({
      files: mockFiles,
      searchString: "somesearchstring",
      options,
    });

    expect(results).toEqual(expectedResults);
    expect(readFile).toHaveBeenCalledTimes(mockFiles.length);
  });

  it("should return matching lines for regular expressions", async () => {
    const options = {
      wholeWord: false,
      caseSensitive: true,
      regex: true,
    };

    readFile.mockImplementation((file) => {
      return mockFileContents[file];
    });

    const expectedResults = [
      {
        file: "file2.js",
        lines: [
          { lineNumber: 1, line: "SomeSearchString is found on this line" },
        ],
      },
      {
        file: "file3.js",
        lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
      },
    ];

    const results = new ProjectSearcher({ readFile }).search({
      files: mockFiles,
      searchString: "found|contains",
      options,
    });

    expect(results).toEqual(expectedResults);
    expect(readFile).toHaveBeenCalledTimes(mockFiles.length);
  });
});
