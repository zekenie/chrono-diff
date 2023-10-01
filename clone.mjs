import pAll from "p-all";
import { format, addDays } from "date-fns";
import { createHash } from "crypto";

export async function cloneRepos({ repos, ...config }) {
  const commits = await pAll(
    repos.map((r) => () => cloneRepo({ repo: r, ...config })),
    { concurrency: 3 }
  );

  return commits;
}

async function cloneRepo({ repo }) {
  await $`git clone ${repo.uri} --branch ${
    repo.branch
  } --single-branch ${hashForRepo(repo)}`;
}

export const slugForRepo = ({ uri, branch }) => `${uri}-${branch}`;

export function hashForRepo(repo) {
  return createHash("sha1").update(slugForRepo(repo)).digest("hex");
}

export async function getHeadCommitForEachDay({
  repo,
  startDate,
  endDate,
  incrementBy,
}) {
  return within(async () => {
    const repoHash = hashForRepo(repo);
    cd(`./${repoHash}`);
    const commits = [];
    let dateCursor = startDate;
    while (dateCursor < endDate) {
      const formattedDate = format(dateCursor, "yyyy-MM-dd");
      const headCommit =
        await $`git rev-list -n 1 --before="${formattedDate}" ${repo.branch}`;
      commits.push({ sha: headCommit.stdout.trim(), date: dateCursor });
      dateCursor = addDays(dateCursor, incrementBy);
    }
    return { repoHash, repo, commits };
  });
}
