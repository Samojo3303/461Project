import { GitHubClient } from '../githubClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN;
if (!token) {
  throw new Error("GitHub token is not defined in environment variables");
}
const client = new GitHubClient(token);

export interface RepositoryQueryResponse {
    data: {
      repository: Repository;
    };
  }
  
export interface Repository {
  collaborators: {
    totalCount: number;
    edges: {
      node: {
        login: string;
      };
    }[];
  };
}

const query = `
  query GetRepoDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      collaborators(first: 10) {
        totalCount
        edges {
          node {
            login
          }
        }
      }
    }
  }
`;

const stats = {
  amt_collaborators: 0 as number
};

export async function metricBusFactor(variables: {owner: string, name: string} ): Promise<number> {
  return client.request<RepositoryQueryResponse>(query, variables, stats)
    .then(response => {
      if (response.data && response.data.repository) {
        if (response.data.repository.collaborators) {
          stats.amt_collaborators = response.data.repository.collaborators.totalCount;
        } else {
          console.log('No collaborators available');
        }
      } else {
        console.error("Repository data is undefined");
      }
      
      console.log(`Collaborators: ${stats.amt_collaborators}`);

      
      return calcBusFactor(stats);
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

function calcBusFactor(stats: any): number {
  // BUS FACTOR: 1 if > 5 or more collaborators, 0 if 1 collaborator
  let mBusFactor: number = clampAndFit01(stats.amt_collaborators, 1, 5);
  return mBusFactor;
}





// HELPER FUNCTIONS 

function clampAndFit01(value: number, in_min: number, in_max: number): number {
  const clampedValue = Math.min(Math.max(value, in_min), in_max);
  return ((clampedValue - in_min) / (in_max - in_min));
}