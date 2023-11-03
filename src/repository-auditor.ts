import type { Octokit } from 'octokit';
import winston from 'winston';

import {
  Auditor,
  AuditWarning,
  GraphqlRepository,
  NameWithOwner,
  RepositoryAuditWarning,
} from './types.js';
import * as repositoryRulesets from './auditors/repository-rulesets';
import * as repositoryDiscussions from './auditors/repository-discussions';
import * as gitLfsObjects from './auditors/git-lfs-objects';
import * as repositoryWebhooks from './auditors/repository-webhooks';
import * as repositoryActionsVariables from './auditors/repository-actions-variables';
import * as repositoryActionsSecrets from './auditors/repository-actions-secrets';
import * as repositoryCodespacesSecrets from './auditors/repository-codespaces-secrets';
import * as repositoryDependabotSecrets from './auditors/repository-dependabot-secrets';
import { getRepositoryWithGraphql } from './repositories';
import { presentError } from './utils';

const DEFAULT_AUDITORS: Auditor[] = [
  repositoryRulesets,
  repositoryDiscussions,
  gitLfsObjects,
  repositoryWebhooks,
  repositoryActionsVariables,
  repositoryActionsSecrets,
  repositoryCodespacesSecrets,
  repositoryDependabotSecrets,
];

export const auditRepositories = async ({
  octokit,
  nameWithOwners,
  logger,
  auditors = DEFAULT_AUDITORS,
  gitHubEnterpriseServerVersion,
}: {
  octokit: Octokit;
  nameWithOwners: NameWithOwner[];
  logger: winston.Logger;
  auditors?: Auditor[];
  gitHubEnterpriseServerVersion: string | undefined;
}): Promise<AuditWarning[]> => {
  const warnings: AuditWarning[] = [];

  for (const { name, owner } of nameWithOwners) {
    const repoWarnings = await auditRepository({
      octokit,
      owner,
      repo: name,
      logger,
      auditors,
      gitHubEnterpriseServerVersion,
    });

    warnings.push(
      ...repoWarnings.map((repoWarning) => ({ ...repoWarning, name, owner })),
    );
  }

  return warnings;
};

export const auditRepository = async ({
  octokit,
  owner,
  repo,
  logger,
  auditors = DEFAULT_AUDITORS,
  gitHubEnterpriseServerVersion,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  logger: winston.Logger;
  auditors?: Auditor[];
  gitHubEnterpriseServerVersion: string | undefined;
}): Promise<RepositoryAuditWarning[]> => {
  const graphqlRepository = await getRepositoryWithGraphql({
    owner,
    name: repo,
    octokit,
  });

  const warnings: RepositoryAuditWarning[] = [];

  for (const auditor of auditors) {
    const auditWarnings = await runAuditor(
      auditor,
      octokit,
      owner,
      repo,
      graphqlRepository,
      logger,
      gitHubEnterpriseServerVersion,
    );
    warnings.push(...auditWarnings);
  }

  return warnings;
};

const runAuditor = async (
  auditor: Auditor,
  octokit: Octokit,
  owner: string,
  repo: string,
  graphqlRepository: GraphqlRepository,
  logger: winston.Logger,
  gitHubEnterpriseServerVersion: string | undefined,
): Promise<RepositoryAuditWarning[]> => {
  logger.debug(`Running auditor ${auditor.TYPE}`, { owner, repo });

  try {
    const warnings = await auditor.auditor({
      graphqlRepository,
      octokit,
      owner,
      repo,
      gitHubEnterpriseServerVersion,
      logger,
    });
    return warnings.map((auditorWarning) => ({ ...auditorWarning, type: auditor.TYPE }));
  } catch (e) {
    logger.error(
      `Auditor \`${auditor.TYPE}\` failed for ${owner}/${repo} with error: ${presentError(
        e,
      )}`,
      { owner, repo },
    );
    return [];
  }
};
