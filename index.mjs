#!/usr/bin/env zx

import ProjectSearcher from "./code-search.mjs";
import lodash from "lodash";
import { readFile } from "./file-access.mjs";
import { cloneRepos, getHeadCommitForEachDay, hashForRepo } from "./clone.mjs";
import pAll from "p-all";
import { visualize } from "./visualize.mjs";

const inputFiles = await Promise.all(
  (await glob("inputs/*.json")).map((path) => fs.readJson(path))
);

const allRepos = lodash.flatten(inputFiles.map((input) => input.repos));

await $`rm -rf tmp-repos`;
await $`mkdir tmp-repos`;
cd("tmp-repos");

await cloneRepos({
  repos: lodash.uniqBy(allRepos, hashForRepo),
});

for (const inputFile of inputFiles) {
  const { startDate, endDate, repos, incrementBy, searches, charts, name } =
    inputFile;

  const commitLists = await pAll(
    repos.map(
      (r) => () =>
        getHeadCommitForEachDay({
          repo: r,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : new Date(),
          incrementBy,
        })
    ),
    { concurrency: 3 }
  );

  const processedSearches = await runInputFile({
    commitLists,
    charts,
    repos,
    searches,
  });

  cd("..");

  await visualize({ processedSearches, charts, name });
}

async function runInputFile({ repos, searches, charts, commitLists }) {
  const searcher = new ProjectSearcher({ readFile });

  const summary = [];

  const reposByName = lodash.keyBy(repos, "name");

  const searchesByRepoHash = lodash.groupBy(searches, (search) => {
    return hashForRepo(reposByName[search.repo]);
  });

  console.log({ searchesByRepoHash, reposByName });

  for (const commitList of commitLists) {
    await within(async () => {
      cd(`./${commitList.repoHash}`);
      for (const commit of commitList.commits) {
        await $`git checkout ${commit.sha}`;
        for (const search of searchesByRepoHash[commitList.repoHash]) {
          const globConfig = { gitignore: true };
          if (search.ignore) {
            globConfig.ignore = search.ignore;
          }
          const matchingFiles = await glob(search.glob || "**/*", globConfig);
          if (search.searchString) {
            const results = searcher.search({
              files: matchingFiles,
              searchString: search.searchString,
              options: search.options,
            });
            summary.push({
              repo: commitList.name,
              fileCount: results.length,
              lines: results.reduce(
                (sum, match) => sum + match.lines.length,
                0
              ),
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
    });
  }

  return summary;
}
