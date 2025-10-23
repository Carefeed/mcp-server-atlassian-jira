import atlassianTransitionsController from './atlassian.transitions.controller.js';
import atlassianIssuesController from './atlassian.issues.controller.js';
import { config } from '../utils/config.util.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { McpError } from '../utils/error.util.js';

describe('Atlassian Transitions Controller', () => {
	// Load configuration and check for credentials before running tests
	beforeAll(() => {
		// Load configuration
		config.load();

		// Check if Atlassian credentials are available
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn('Atlassian credentials are required for these tests.');
		}
	});

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	// Helper to get a valid issue key for testing
	async function getFirstIssueKey(): Promise<string | null> {
		if (skipIfNoCredentials()) return null;
		try {
			const listResult = await atlassianIssuesController.list({
				limit: 1,
			});

			// Extract an issue key from the content using regex
			const match = listResult.content.match(/\b([A-Z]+-\d+)\b/);
			return match ? match[1] : null;
		} catch (error) {
			console.warn('Error getting issue key for tests:', error);
			return null;
		}
	}

	describe('getTransitions', () => {
		it('should retrieve available transitions for an issue', async () => {
			if (skipIfNoCredentials()) return;

			// Get a valid issue key first
			const issueKey = await getFirstIssueKey();
			if (!issueKey) {
				console.warn('Skipping transitions test: No issue key found');
				return;
			}

			// Call the controller
			const result = await atlassianTransitionsController.getTransitions({
				issueIdOrKey: issueKey,
			});

			// Check the structure and types
			expect(result).toBeDefined();
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Should contain transition information
			expect(result.content).toContain('Available Transitions for');
			expect(result.content).toMatch(/Found \d+ available transition/);

			// Should have instructions
			expect(result.content).toContain('jira_transition_issue');
		}, 30000);

		it('should handle error for invalid issue key', async () => {
			if (skipIfNoCredentials()) return;

			try {
				await atlassianTransitionsController.getTransitions({
					issueIdOrKey: 'INVALID-KEY-99999',
				});
				fail('Expected an error for invalid issue key');
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				// Error should indicate issue not found
				const errorMessage = (error as Error).message;
				expect(errorMessage).toContain('not found');
			}
		}, 30000);
	});

	describe('transitionIssue', () => {
		it('should handle error for invalid issue key', async () => {
			if (skipIfNoCredentials()) return;

			try {
				await atlassianTransitionsController.transitionIssue({
					issueIdOrKey: 'INVALID-KEY-99999',
					transitionId: '1',
				});
				fail('Expected an error for invalid issue key');
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
			}
		}, 30000);

		it('should handle error for invalid transition ID', async () => {
			if (skipIfNoCredentials()) return;

			// Get a valid issue key
			const issueKey = await getFirstIssueKey();
			if (!issueKey) {
				console.warn('Skipping transition test: No issue key found');
				return;
			}

			try {
				await atlassianTransitionsController.transitionIssue({
					issueIdOrKey: issueKey,
					transitionId: 'INVALID_TRANSITION_999',
				});
				fail('Expected an error for invalid transition');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				const errorMessage = (error as Error).message;
				expect(errorMessage).toContain('not found');
			}
		}, 30000);
	});
});
