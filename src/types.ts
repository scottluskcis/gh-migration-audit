import type { Octokit } from 'octokit';
import winston from 'winston';

export interface GraphqlRepository {
  id: string;
  discussions: {
    totalCount: number;
  };
}

export interface AuditorWarning {
  message: string;
}

export interface RepositoryAuditWarning {
  message: string;
  type: string;
}

export interface AuditWarning {
  message: string;
  type: string;
  name: string;
  owner: string;
}

export interface NameWithOwner {
  owner: string;
  name: string;
}

export type AuditorFunctionArgs = {
  graphqlRepository: GraphqlRepository;
  octokit: Octokit;
  owner: string;
  repo: string;
  gitHubEnterpriseServerVersion: string | undefined;
  logger: winston.Logger;
};

export type AuditorFunction = ({
  graphqlRepository,
  octokit,
  owner,
  repo,
  gitHubEnterpriseServerVersion,
  logger,
}: AuditorFunctionArgs) => Promise<AuditorWarning[]>;

export interface Auditor {
  TYPE: string;
  auditor: AuditorFunction;
}
