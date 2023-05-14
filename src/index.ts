#!/usr/bin/env zx

/**
 * zx src/index.ts --repo https://github.com/get-frank-eng/monorepo --lookback 900 --incrementDateBy 15 --searches searches.json
 */

import "zx/globals";
import ProjectSearcher, { SearchOptions } from "./code-search";
import { format, addDays, sub } from "date-fns";
import { join } from "path";

const repo = (argv.repo || (await question("What is the repo URL?"))) as string;
const branch = argv.branch || "main";
const lookback = argv.lookback ? Number(argv.lookback) : 30;
const searchesFilePath = argv.searches;
const incrementDateBy = argv.incrementDateBy ? Number(argv.incrementDateBy) : 1;

const searches = (await fs.readJSON(searchesFilePath)) as {
  searches: {
    name: string;
    searchString?: string;
    rootDir?: string;
    options: SearchOptions;
  }[];
};

const endDate = argv.endDate ? new Date(argv.endDate) : new Date();
const startDate = sub(endDate, { days: lookback });

await $`rm -rf tmp-repo`;
await $`git clone ${repo} --branch ${branch} --single-branch tmp-repo`;

const searcher = new ProjectSearcher("tmp-repo");

const summary: {
  count: number;
  date: Date;
  sha: string;
  searchName: string;
}[] = [];

const commitsForEachDay = await getHeadCommitForEachDay();

for (const commit of commitsForEachDay) {
  await $`git checkout ${commit.sha}`;
  for (const search of searches.searches) {
    const matchingFiles = await glob(join("tmp-repo", search.rootDir || ""), {
      gitignore: true,
    });
    if (search.searchString) {
      const results = await searcher.search({
        files: matchingFiles,
        searchString: search.searchString,
        options: search.options,
      });
      summary.push({
        count: results.length,
        date: commit.date,
        searchName: search.name,
        sha: commit.sha,
      });
    } else {
      summary.push({
        count: matchingFiles.length,
        date: commit.date,
        searchName: search.name,
        sha: commit.sha,
      });
    }
  }
}

await fs.writeJSON("./search-over-time-summary.json", summary);

async function getHeadCommitForEachDay() {
  const commits: { sha: string; date: Date }[] = [];
  let dateCursor = startDate;
  while (dateCursor < endDate) {
    const formattedDate = format(dateCursor, "yyyy-MM-dd");
    const headCommit =
      await $`git rev-list -n 1 --before="${formattedDate}" main`;
    commits.push({ sha: headCommit.stdout.trim(), date: dateCursor });
    dateCursor = addDays(dateCursor, incrementDateBy);
  }
  return commits;
}
