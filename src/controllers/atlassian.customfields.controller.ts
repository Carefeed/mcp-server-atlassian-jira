import { Logger } from '../utils/logger.util.js';
import atlassianIssuesService from '../services/vendor.atlassian.issues.service.js';

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.customfields.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Jira custom fields controller initialized');

/**
 * Get options for a custom field
 * @param fieldId Custom field ID (numeric part only, e.g., "10275")
 * @param startAt Starting index for pagination
 * @param maxResults Maximum results to return
 * @returns Formatted custom field options response
 */
async function getCustomFieldOptions(
	fieldId: string,
	startAt = 0,
	maxResults = 100,
) {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.customfields.controller.ts',
		'getCustomFieldOptions',
	);

	methodLogger.debug(
		`Getting options for custom field: ${fieldId}`,
	);

	const response = await atlassianIssuesService.getCustomFieldOptions(
		fieldId,
		startAt,
		maxResults,
	);

	methodLogger.debug('Retrieved custom field options successfully');

	// Format the response
	let content = `# Custom Field Options\n\n`;
	content += `**Field ID**: customfield_${fieldId}\n\n`;
	content += `**Total Options**: ${response.total}\n`;
	content += `**Showing**: ${response.values.length} options (starting at ${response.startAt})\n\n`;

	if (response.values.length > 0) {
		content += `## Available Options\n\n`;
		response.values.forEach((option) => {
			const disabled = option.disabled ? ' (disabled)' : '';
			content += `- **${option.value}**${disabled}\n`;
			content += `  - ID: ${option.id}\n`;
		});
	} else {
		content += `*No options available for this field.*\n`;
	}

	if (!response.isLast) {
		content += `\n*More results available. Use startAt=${response.startAt + response.values.length} to see more.*\n`;
	}

	return {
		content,
	};
}

export default {
	getCustomFieldOptions,
};
