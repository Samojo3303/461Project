import { GitHubClient } from '../githubClient.js';
import * as dotenv from 'dotenv';
dotenv.config();
const token = process.env.GITHUB_TOKEN;
if (!token) {
    throw new Error("GitHub token is not defined in environment variables");
}
const client = new GitHubClient(token);
const query = `
  query GetRepoDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 50) {
              edges {
                node {
                  author {
                    user {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
export async function metricBusFactor(variables) {
    const stats = {
        list_commits_authors: []
    };
    return client.request(query, variables, stats)
        .then(response => {
        if (response.data && response.data.repository) { //IF REPOSITORY DATA IS AVAILABLE
            if (response.data.repository.defaultBranchRef && response.data.repository.defaultBranchRef.target) { //IF BRANCH DATA IS AVAILABLE
                if (response.data.repository.defaultBranchRef.target.history) { //IF COMMIT HISTORY IS AVAILABLE
                    response.data.repository.defaultBranchRef.target.history.edges.forEach(edge => {
                        if (edge.node.author && edge.node.author.user && edge.node.author.user.login) {
                            stats.list_commits_authors.push(edge.node.author.user.login); //lists_commits_authors INSERT
                        }
                    });
                }
                else {
                    console.log('No commit history available');
                }
            }
            else {
                console.log('No branch available');
            }
        }
        else {
            console.error("Repository data is undefined");
        }
        return calcBusFactor(stats);
    })
        .catch(error => {
        console.error(error);
        throw error;
    });
}
function calcBusFactor(stats) {
    // BUS FACTOR: 1 if > 5 or more collaborators, 0 if 1 collaborator
    const uniqueArray = Array.from(new Set(stats.list_commits_authors));
    //console.log('Authors:', uniqueArray);
    //console.log('Unique authors:', uniqueArray.length);
    let mBusFactor = clampAndFit01(uniqueArray.length, 1, 5);
    return mBusFactor;
}
// HELPER FUNCTIONS 
function clampAndFit01(value, in_min, in_max) {
    const clampedValue = Math.min(Math.max(value, in_min), in_max);
    return ((clampedValue - in_min) / (in_max - in_min));
}
