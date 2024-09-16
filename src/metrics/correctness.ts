import * as git from 'isomorphic-git';
import fs from 'fs';

// Analyze Commit Activity Density (CAD)
export async function calculateCAD(localPath: string): Promise<number> {
  try {
    // Get commit history
    const log = await git.log({ fs, dir: localPath });

    if (log.length === 0) {
      return 0; // No commits, so CAD is 0
    }

    // Get the date of the first and last commit
    const firstCommitDate = new Date(log[log.length - 1].commit.author.timestamp * 1000);
    const lastCommitDate = new Date(log[0].commit.author.timestamp * 1000);

    // Calculate the repository age in days
    const repoAgeInDays = Math.max((lastCommitDate.getTime() - firstCommitDate.getTime()) / (1000 * 60 * 60 * 24), 1); // To avoid division by zero

    // Calculate commits per day
    const commitsPerDay = log.length / repoAgeInDays;

    // Normalize the CAD
    const maxCAD = 5;
    const normalizedCAD = Math.min(commitsPerDay / maxCAD, 1);

    return normalizedCAD;
  } catch (error) {
    console.error(`Failed to calculate CAD:`, error);
    throw error;
  }
}
