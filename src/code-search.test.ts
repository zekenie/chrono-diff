// import { search, SearchOptions, SearchResult } from "./code-search";
// import fs from "fs";

// jest.mock("fs");

// describe("search", () => {
//   beforeEach(() => {
//     global.glob = jest.fn() as unknown as typeof global.glob;
//   });
//   const mockFiles = ["file1.txt", "file2.js", "file3.js", "file4.txt"];

//   const mockFileContents: Record<string, string> = {
//     "file1.txt": "This is a sample text file",
//     "file2.js": "SomeSearchString is found on this line",
//     "file3.js": "This line contains SomeSearchString",
//     "file4.txt": "No match here",
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return an empty array when no files are found", async () => {
//     const options: SearchOptions = {
//       wholeWord: true,
//       caseSensitive: true,
//       regex: false,
//     };

//     (fs.readFileSync as unknown as jest.Mock).mockImplementation(
//       (file: string) => {
//         return mockFileContents[file];
//       }
//     );

//     const results = await search("./nonexistent", "SomeSearchString", options);

//     expect(results).toEqual([]);
//     expect(glob).toHaveBeenCalledTimes(1);
//   });

//   it("should return an empty array when no matching lines are found", async () => {
//     const options: SearchOptions = {
//       wholeWord: true,
//       caseSensitive: true,
//       regex: false,
//     };

//     (glob as unknown as jest.Mock).mockResolvedValue(mockFiles);
//     (fs.readFileSync as unknown as jest.Mock).mockReturnValue("");

//     const results = await search("./mockDir", "NoMatch", options);

//     expect(results).toEqual([]);
//     expect(glob).toHaveBeenCalledTimes(1);
//   });

//   it("should return matching lines when files and matching lines are found", async () => {
//     const options: SearchOptions = {
//       wholeWord: true,
//       caseSensitive: true,
//       regex: false,
//     };

//     (glob as unknown as jest.Mock).mockResolvedValue(mockFiles);

//     (fs.readFileSync as unknown as jest.Mock).mockImplementation(
//       (file: string) => {
//         return mockFileContents[file];
//       }
//     );

//     const expectedResults: SearchResult[] = [
//       {
//         file: "file2.js",
//         lines: [
//           { lineNumber: 1, line: "SomeSearchString is found on this line" },
//         ],
//       },
//       {
//         file: "file3.js",
//         lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
//       },
//     ];

//     const results = await search("./mockDir", "SomeSearchString", options);

//     expect(results).toEqual(expectedResults);
//     expect(glob).toHaveBeenCalledTimes(1);
//     expect(fs.readFileSync).toHaveBeenCalledTimes(mockFiles.length);
//   });

//   it("should return matching lines as whole words when wholeWord option is enabled", async () => {
//     const options: SearchOptions = {
//       wholeWord: true,
//       caseSensitive: false,
//       regex: false,
//     };

//     (glob as unknown as jest.Mock).mockResolvedValue(mockFiles);

//     (fs.readFileSync as unknown as jest.Mock).mockImplementation(
//       (file: string) => {
//         return mockFileContents[file];
//       }
//     );

//     const expectedResults: SearchResult[] = [
//       {
//         file: "file2.js",
//         lines: [
//           { lineNumber: 1, line: "SomeSearchString is found on this line" },
//         ],
//       },
//       {
//         file: "file3.js",
//         lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
//       },
//     ];

//     const results = await search("./mockDir", "somesearchstring", options);

//     expect(results).toEqual(expectedResults);
//     expect(glob).toHaveBeenCalledTimes(1);
//     expect(fs.readFileSync).toHaveBeenCalledTimes(mockFiles.length);
//   });

//   it("respects gitignore", async () => {
//     const options: SearchOptions = {
//       wholeWord: true,
//       caseSensitive: true,
//       regex: false,
//     };

//     (glob as unknown as jest.Mock).mockResolvedValue(mockFiles);

//     (fs.readFileSync as unknown as jest.Mock).mockImplementation(
//       (file: string) => {
//         return mockFileContents[file];
//       }
//     );

//     const expectedResults: SearchResult[] = [
//       {
//         file: "file3.js",
//         lines: [{ lineNumber: 1, line: "This line contains SomeSearchString" }],
//       },
//     ];

//     const results = await search(
//       "./mockDir",
//       "SomeSearchString",
//       options,
//       "file2.js"
//     );

//     expect(results).toEqual(expectedResults);
//     expect(glob).toHaveBeenCalledTimes(1);
//     expect(fs.readFileSync).toHaveBeenCalledTimes(mockFiles.length - 1);
//   });
// });
