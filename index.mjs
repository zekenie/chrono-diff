#!/usr/bin/env zx

/**
 * index.mjs --repo git@github.com:get-frank-eng/monorepo.git --lookback 100 --incrementDateBy 15 --searches searches.json
 */

import ProjectSearcher from "./code-search.mjs";
import { format, addDays, sub } from "date-fns";
import { join } from "path";

const repo = argv.repo || (await question("What is the repo URL?"));
const branch = argv.branch || "main";
const lookback = argv.lookback ? Number(argv.lookback) : 30;
const searchesFilePath = argv.searches;
const incrementDateBy = argv.incrementDateBy ? Number(argv.incrementDateBy) : 1;

const searches = await fs.readJSON(searchesFilePath);

const endDate = argv.endDate ? new Date(argv.endDate) : new Date();
const startDate = sub(endDate, { days: lookback });

await $`rm -rf tmp-repo`;
await $`git clone ${repo} --branch ${branch} --single-branch tmp-repo`;
cd("tmp-repo");

const searcher = new ProjectSearcher();

const summary = [];

const commitsForEachDay = await getHeadCommitForEachDay();

for (const commit of commitsForEachDay) {
  await $`git checkout ${commit.sha}`;
  for (const search of searches.searches) {
    const matchingFiles = await glob(join(search.rootDir || "**/*"), {
      gitignore: true,
    });
    if (search.searchString) {
      const results = await searcher.search({
        files: matchingFiles,
        searchString: search.searchString,
        options: search.options,
      });
      summary.push({
        fileCount: results.length,
        lines: results.reduce((sum, match) => sum + match.lines.length, 0),
        date: commit.date,
        searchName: search.name,
        sha: commit.sha,
      });
    } else {
      const lines = matchingFiles.reduce((lineCount, file) => {
        return (
          lineCount +
          fs.readFileSync(file, "utf-8").toString().split("\n").length
        );
      }, 0);
      summary.push({
        fileCount: matchingFiles.length,
        lines,
        date: commit.date,
        searchName: search.name,
        sha: commit.sha,
      });
    }
  }
}

console.log(JSON.stringify(summary, null, 2));

await fs.writeJSON("../search-over-time-summary.json", {
  data: summary,
  charts: searches.charts,
});

async function getHeadCommitForEachDay() {
  const commits = [];
  let dateCursor = startDate;
  while (dateCursor < endDate) {
    const formattedDate = format(dateCursor, "yyyy-MM-dd");
    const headCommit =
      await $`git rev-list -n 1 --before="${formattedDate}" ${branch}`;
    commits.push({ sha: headCommit.stdout.trim(), date: dateCursor });
    dateCursor = addDays(dateCursor, incrementDateBy);
  }
  return commits;
}
