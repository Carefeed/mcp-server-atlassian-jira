import { Logger } from '../utils/logger.util.js';
import atlassianIssuesService from '../services/vendor.atlassian.issues.service.js';
import { UpdateIssueToolArgsType } from '../tools/atlassian.issues.update.types.js';
import { formatUpdateIssueResponse } from './atlassian.issues.update.formatter.js';
import { UpdateIssueParams, Issue } from '../services/vendor.atlassian.issues.types.js';
import { markdownToAdf } from '../utils/adf-from-markdown.util.js';

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.issues.update.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Jira issues update controller initialized');

/**
 * Update an existing Jira issue
 * @param args Arguments containing issue update data
 * @returns Formatted update issue response
 */
async function updateIssue(args: UpdateIssueToolArgsType) {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.issues.update.controller.ts',
		'updateIssue',
	);

	methodLogger.debug(`Updating issue ${args.issueIdOrKey}:`, args);

	// Build the fields object for issue update
	const fields: Record<string, unknown> = {};

	// Add summary if provided
	if (args.summary !== undefined) {
		fields.summary = args.summary;
	}

	// Add description as ADF if provided
	if (args.description !== undefined) {
		fields.description = markdownToAdf(args.description);
	}

	// Add priority if provided
	if (args.priority !== undefined) {
		// Try as ID first, then as name
		if (/^\d+$/.test(args.priority)) {
			fields.priority = { id: args.priority };
		} else {
			fields.priority = { name: args.priority };
		}
	}

	// Add assignee if provided (empty string unassigns)
	if (args.assignee !== undefined) {
		if (args.assignee === '') {
			fields.assignee = null;
		} else {
			fields.assignee = { accountId: args.assignee };
		}
	}

	// Add labels if provided
	if (args.labels !== undefined) {
		fields.labels = args.labels;
	}

	// Add components if provided
	if (args.components !== undefined) {
		fields.components = args.components.map((comp) => {
			// Try as ID first, then as name
			if (/^\d+$/.test(comp)) {
				return { id: comp };
			} else {
				return { name: comp };
			}
		});
	}

	// Add fix versions if provided
	if (args.fixVersions !== undefined) {
		fields.fixVersions = args.fixVersions.map((version) => {
			// Try as ID first, then as name
			if (/^\d+$/.test(version)) {
				return { id: version };
			} else {
				return { name: version };
			}
		});
	}

	// Add custom fields if provided
	if (args.customFields) {
		Object.assign(fields, args.customFields);
	}

	const updateParams: UpdateIssueParams = {
		fields: Object.keys(fields).length > 0 ? fields : undefined,
		notifyUsers: args.notifyUsers,
	};

	methodLogger.debug('Calling service to update issue with params:', updateParams);

	const result = await atlassianIssuesService.updateIssue(
		args.issueIdOrKey,
		updateParams,
	);

	methodLogger.debug('Updated issue successfully');

	return {
		content: formatUpdateIssueResponse(args.issueIdOrKey, result as Issue | undefined),
	};
}

export default {
	updateIssue,
};
