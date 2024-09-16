import * as git from 'isomorphic-git';
import fs from 'fs';

// Analyze contributor activity (bus factor)
export async function analyzeContributors(localPath: string): Promise<number> {
  try {
    // Get the commit log
    const log = await git.log({ fs, dir: localPath, depth: 100 });
    
    // Extract unique contributor names
    const contributors = new Set(log.map(entry => entry.commit.author.name));

    // Calculate the contributor score: If more than 5 contributors, max score is 1
    return contributors.size > 5 ? 1 : contributors.size / 5;
  } catch (error) {
    console.error(`Failed to analyze contributors at ${localPath}:`, error);
    throw error;
  }
}