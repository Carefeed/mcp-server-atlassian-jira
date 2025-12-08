/**
 * Formatter for Jira issue update responses
 */

import {
	formatHeading,
	formatBulletList,
	formatUrl,
	formatDate,
	formatSeparator,
} from '../utils/formatter.util.js';
import { Issue } from '../services/vendor.atlassian.issues.types.js';

/**
 * Format update issue response for display
 * @param issueIdOrKey - The issue key that was updated
 * @param updatedIssue - Optional issue data if returnIssue was true
 * @returns Formatted string with update result in markdown format
 */
export function formatUpdateIssueResponse(
	issueIdOrKey: string,
	updatedIssue?: Issue,
): string {
	const lines: string[] = [];

	lines.push(formatHeading('Issue Updated Successfully', 1));
	lines.push('');

	if (updatedIssue) {
		const issueInfo = {
			'Issue Key': updatedIssue.key,
			'Issue ID': updatedIssue.id,
			Summary: updatedIssue.fields?.summary || 'N/A',
			Status: updatedIssue.fields?.status?.name || 'N/A',
			'Browse URL': formatUrl(
				updatedIssue.self.replace('/rest/api/3/issue/', '/browse/'),
				'View in Browser',
			),
		};

		lines.push(formatBulletList(issueInfo));
	} else {
		const issueInfo = {
			'Issue Key': issueIdOrKey,
			'Browse URL': formatUrl(
				`/browse/${issueIdOrKey}`,
				'View in Browser',
			),
		};

		lines.push(formatBulletList(issueInfo));
		lines.push('');
		lines.push('*Issue updated successfully. Use jira_get_issue to view the updated details.*');
	}

	lines.push('');
	lines.push(formatSeparator());
	lines.push(`*Issue updated at: ${formatDate(new Date())}*`);

	return lines.join('\n');
}
