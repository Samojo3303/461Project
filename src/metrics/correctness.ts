import * as fs from 'fs-extra';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import path from 'path';

// Define the repository directory
const REPO_DIR = path.join(__dirname, 'repo');

export async function cloneRepository(repoUrl: string): Promise<void> {
  if (fs.existsSync(REPO_DIR)) {
    await fs.remove(REPO_DIR);
  }
  await fs.ensureDir(REPO_DIR);

  await git.clone({
    fs,
    http,
    dir: REPO_DIR,
    url: repoUrl,
    singleBranch: true,
    depth: 1,
  });
}

export async function getRepositoryInfo(): Promise<any> {
  const commits = await git.log({
    fs,
    dir: REPO_DIR,
  });
  return commits;
}

export async function checkRepositoryCorrectness(): Promise<boolean> {
  const info = await getRepositoryInfo();
  return info.length > 0; // Basic check, you can expand this.
}