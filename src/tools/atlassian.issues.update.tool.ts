import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	type UpdateIssueToolArgsType,
	UpdateIssueToolArgsSchema,
} from './atlassian.issues.update.types.js';
import atlassianIssuesUpdateController from '../controllers/atlassian.issues.update.controller.js';

// Create a contextualized logger for this file
const toolLogger = Logger.forContext('tools/atlassian.issues.update.tool.ts');

// Log tool module initialization
toolLogger.debug('Jira issues update tool module initialized');

/**
 * MCP Tool: Update Jira Issue
 *
 * Updates an existing issue in Jira with new field values.
 * Supports updating summary, description, priority, assignee, labels, and custom fields.
 *
 * @param {UpdateIssueToolArgsType} args - Tool arguments for updating the issue
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with update result
 * @throws Will return error message if issue update fails
 */
async function updateIssue(args: Record<string, unknown>) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.issues.update.tool.ts',
		'updateIssue',
	);

	methodLogger.debug('Updating issue:', args);

	try {
		const result = await atlassianIssuesUpdateController.updateIssue(
			args as UpdateIssueToolArgsType,
		);
		methodLogger.debug('Successfully updated issue');

		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Failed to update issue', error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Issues Update MCP Tools
 *
 * Registers the update-issue tool with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function registerTools(server: McpServer): void {
	const registerLogger = Logger.forContext(
		'tools/atlassian.issues.update.tool.ts',
		'registerTools',
	);

	// Register update issue tool
	server.tool(
		'jira_update_issue',
		'Update an existing Jira issue. Supports updating summary, description (markdown format, converted to ADF), priority, assignee, labels, components, fix versions, and custom fields. At least one field to update must be provided.',
		UpdateIssueToolArgsSchema.shape,
		updateIssue,
	);
	registerLogger.debug('Registered jira_update_issue tool');

	registerLogger.debug(
		'All Jira issue update tools registered successfully',
	);
}

export default {
	registerTools,
};
