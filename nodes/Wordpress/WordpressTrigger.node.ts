import type {
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class WordpressTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WordPress Trigger',
		name: 'wordpressTrigger',
		icon: 'file:wordpress.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle WordPress events via webhooks',
		defaults: {
			name: 'WordPress Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Any Event',
						value: 'any',
						description: 'Triggered on any supported event',
					},
					{
						name: 'Comment Created',
						value: 'comment_created',
						description: 'Triggered when a new comment is posted',
					},
					{
						name: 'Post Deleted',
						value: 'post_deleted',
						description: 'Triggered when a post is deleted',
					},
					{
						name: 'Post Published',
						value: 'post_published',
						description: 'Triggered when a post is published',
					},
					{
						name: 'Post Updated',
						value: 'post_updated',
						description: 'Triggered when a post is updated',
					},
					{
						name: 'User Registered',
						value: 'user_registered',
						description: 'Triggered when a new user registers',
					},
				],
				default: 'post_published',
				required: true,
				description: 'The event to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Secret Token',
						name: 'secretToken',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description:
							'Optional secret token for webhook request validation. Must match the token configured in WordPress (X-WP-Webhook-Token header).',
					},
					{
						displayName: 'Filter by Post Type',
						name: 'postType',
						type: 'string',
						default: '',
						placeholder: 'e.g., post, page, product',
						description:
							'Only trigger for specific post types. Leave empty to trigger for all types.',
						displayOptions: {
							show: {
								'/event': ['post_published', 'post_updated', 'post_deleted', 'any'],
							},
						},
					},
					{
						displayName: 'Filter by Post Status',
						name: 'postStatus',
						type: 'multiOptions',
						options: [
							{ name: 'Draft', value: 'draft' },
							{ name: 'Future', value: 'future' },
							{ name: 'Pending', value: 'pending' },
							{ name: 'Private', value: 'private' },
							{ name: 'Publish', value: 'publish' },
						],
						default: [],
						description: 'Only trigger for specific post statuses. Leave empty to trigger for all.',
						displayOptions: {
							show: {
								'/event': ['post_published', 'post_updated', 'any'],
							},
						},
					},
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Validate secret token if configured
		if (options.secretToken) {
			const headerToken = req.headers['x-wp-webhook-token'] as string;
			if (headerToken !== options.secretToken) {
				return {
					webhookResponse: JSON.stringify({ error: 'Invalid token' }),
				};
			}
		}

		// Get incoming event type from body or header
		const incomingEvent =
			(body.event as string) || (req.headers['x-wp-webhook-event'] as string) || 'unknown';

		// Filter by event type
		if (event !== 'any' && incomingEvent !== event) {
			return {
				webhookResponse: JSON.stringify({
					status: 'ignored',
					reason: 'Event not matched',
					expected: event,
					received: incomingEvent,
				}),
			};
		}

		// Filter by post type
		if (options.postType && body.post_type) {
			if (body.post_type !== options.postType) {
				return {
					webhookResponse: JSON.stringify({
						status: 'ignored',
						reason: 'Post type not matched',
						expected: options.postType,
						received: body.post_type,
					}),
				};
			}
		}

		// Filter by post status
		if (options.postStatus && Array.isArray(options.postStatus) && options.postStatus.length > 0) {
			const postStatus = body.post_status as string;
			const allowedStatuses = options.postStatus as string[];
			if (postStatus && !allowedStatuses.includes(postStatus)) {
				return {
					webhookResponse: JSON.stringify({
						status: 'ignored',
						reason: 'Post status not matched',
						expected: allowedStatuses,
						received: postStatus,
					}),
				};
			}
		}

		// Build output data
		const outputData: IDataObject = {
			event: incomingEvent,
			receivedAt: new Date().toISOString(),
			...body,
		};

		return {
			webhookResponse: JSON.stringify({ status: 'success', event: incomingEvent }),
			workflowData: [this.helpers.returnJsonArray([outputData])],
		};
	}
}
