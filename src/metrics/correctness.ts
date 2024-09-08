import * as git from 'isomorphic-git';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';  // For HTTP cloning

// Clone a repository
async function cloneRepository(repoUrl: string, dir: string) {
  await git.clone({
    fs,
    http,
    dir,
    url: repoUrl,
    singleBranch: true,
    depth: 1  // Only clone the latest commit for testing
  });
}

// Example: Clone a repository from GitHub
cloneRepository('https://github.com/cloudinary/cloudinary_npm', './repo').then(() => {
  console.log('Repository cloned');
});

// Read the latest commit
async function checkLatestCommit(dir: string) {
    const latestCommit = await git.log({ fs, dir, depth: 1 });
    console.log('Latest commit: ', latestCommit);
  }
  
  // Example: Get the latest commit from the cloned repository
  checkLatestCommit('./repo');

async function checkTags(dir: string) {
  const tags = await git.listTags({ fs, dir });
  console.log('Tags: ', tags);
  
  if (!tags.length) {
    console.warn('No tags found! This could indicate the repository lacks proper versioning.');
  }
}

// Check size of the repository by scanning files
function checkRepoSize(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let totalSize = 0;
  
    files.forEach(file => {
      if (file.isFile()) {
        const fileSize = fs.statSync(`${dir}/${file.name}`).size;
        totalSize += fileSize;
      }
    });
  
    console.log('Repository size:', totalSize, 'bytes');
    
    // Add logic to warn if the repo size exceeds a certain threshold
    if (totalSize > 50 * 1024 * 1024) { // 50 MB as a threshold example
      console.warn('Repository size exceeds recommended limit.');
    }
  }

async function checkBranches(dir: string) {
  const branches = await git.listBranches({ fs, dir });
  console.log('Branches: ', branches);
  
  if (!branches.includes('main') && !branches.includes('master')) {
    console.warn('Main branch is missing or has an unusual name');
  }
}

async function checkCommitMessages(dir: string) {
    const commits = await git.log({ fs, dir, depth: 10 });
    commits.forEach(commit => {
      if (commit.commit.message.includes('test') || commit.commit.message.includes('lint')) {
        console.log(`Commit "${commit.oid}" mentions testing or linting`);
      }
    });
  }

async function calculateCorrectnessScore(repoUrl: string, dir: string) {
  // Clone the repository
  await cloneRepository(repoUrl, dir);
  
  // Run all the checks
  await checkLatestCommit(dir);
  await checkTags(dir);
  await checkBranches(dir);
  checkRepoSize(dir);
  await checkCommitMessages(dir);

  // Based on the results of each check, assign scores (0.0 to 1.0)
  let correctnessScore = 0.8;  // For illustration; adjust based on actual checks

  return correctnessScore;
}

// Example usage
calculateCorrectnessScore('https://github.com/cloudinary/cloudinary_npm', './repo').then(score => {
  console.log('Correctness Score:', score);
});

