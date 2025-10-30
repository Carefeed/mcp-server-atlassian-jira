import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import atlassianCustomFieldsController from '../controllers/atlassian.customfields.controller.js';

// Create a contextualized logger for this file
const toolLogger = Logger.forContext('tools/atlassian.customfields.tool.ts');

// Log tool module initialization
toolLogger.debug('Jira custom fields tool module initialized');

/**
 * Tool arguments schema for getting custom field options
 */
const GetCustomFieldOptionsToolArgsSchema = z.object({
	fieldId: z
		.string()
		.describe(
			'Custom field ID (numeric part only, e.g., "10275" for customfield_10275)',
		),
	startAt: z
		.number()
		.optional()
		.default(0)
		.describe('Starting index for pagination (default: 0)'),
	maxResults: z
		.number()
		.optional()
		.default(100)
		.describe('Maximum results to return (default: 100, max: 100)'),
});

/**
 * MCP Tool: Get Custom Field Options
 *
 * Gets the available options for a custom field in Jira.
 * Useful for discovering allowed values for select lists, checkboxes, etc.
 *
 * @param {GetCustomFieldOptionsToolArgsType} args - Tool arguments for getting custom field options
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted options
 * @throws Will return error message if options retrieval fails
 */
async function getCustomFieldOptions(args: Record<string, unknown>) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.customfields.tool.ts',
		'getCustomFieldOptions',
	);
	methodLogger.debug('Getting custom field options:', args);

	try {
		const validatedArgs =
			GetCustomFieldOptionsToolArgsSchema.parse(args);

		const result =
			await atlassianCustomFieldsController.getCustomFieldOptions(
				validatedArgs.fieldId,
				validatedArgs.startAt,
				validatedArgs.maxResults,
			);

		methodLogger.debug('Successfully retrieved custom field options');

		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Error getting custom field options:', error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register custom field tools with the MCP server
 * @param server MCP server instance
 */
function registerCustomFieldTools(server: McpServer) {
	toolLogger.debug('Registering custom field tools');

	// Register get custom field options tool
	server.tool(
		'jira_get_customfield_options',
		'Get available options for a custom field. Use this to discover valid values for select lists, checkboxes, and other custom fields that have predefined options. Provide the numeric field ID only (e.g., "10275" for customfield_10275).',
		GetCustomFieldOptionsToolArgsSchema.shape,
		getCustomFieldOptions,
	);

	toolLogger.debug('Custom field tools registered successfully');
}

export { registerCustomFieldTools };
