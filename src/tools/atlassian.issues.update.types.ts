/**
 * Types for Atlassian Issues update MCP tools
 */
import { z } from 'zod';

/**
 * Arguments for updating an issue
 */
export const UpdateIssueToolArgsSchema = z.object({
	issueIdOrKey: z
		.string()
		.describe(
			'The ID or key of the Jira issue to update (e.g., "PROJ-123" or "10001")',
		),
	summary: z
		.string()
		.optional()
		.describe('Updated issue summary/title'),
	description: z
		.string()
		.optional()
		.describe('Updated issue description in markdown format'),
	priority: z
		.string()
		.optional()
		.describe('Updated priority name or ID'),
	assignee: z
		.string()
		.optional()
		.describe('Updated assignee account ID (use empty string to unassign)'),
	labels: z
		.array(z.string())
		.optional()
		.describe('Updated array of labels (replaces existing labels)'),
	components: z
		.array(z.string())
		.optional()
		.describe('Updated array of component IDs or names'),
	fixVersions: z
		.array(z.string())
		.optional()
		.describe('Updated array of fix version IDs or names'),
	customFields: z
		.record(z.string(), z.unknown())
		.optional()
		.describe(
			'Custom fields to update as key-value pairs (e.g., {"customfield_10001": "value"})',
		),
	notifyUsers: z
		.boolean()
		.optional()
		.describe('Whether to notify users about the update (default: true)'),
});

export type UpdateIssueToolArgs = z.infer<typeof UpdateIssueToolArgsSchema>;
export type UpdateIssueToolArgsType = UpdateIssueToolArgs;
