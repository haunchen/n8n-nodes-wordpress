import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tag'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a tag',
				action: 'Create a tag',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a tag',
				action: 'Delete a tag',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a tag',
				action: 'Get a tag',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many tags',
				action: 'Get many tags',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a tag',
				action: 'Update a tag',
			},
		],
		default: 'create',
	},
];

export const tagFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                 tag:create                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
			},
		},
		description: 'HTML title for the term',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'HTML description of the term',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'An alphanumeric identifier for the term unique to its type',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                 tag:update                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['update'],
			},
		},
		description: 'Unique identifier for the term',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'HTML description of the term',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'HTML title for the term',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'An alphanumeric identifier for the term unique to its type',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                   tag:get                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['get'],
			},
		},
		description: 'Unique identifier for the term',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Context',
				name: 'context',
				type: 'options',
				options: [
					{
						name: 'Edit',
						value: 'edit',
					},
					{
						name: 'Embed',
						value: 'embed',
					},
					{
						name: 'View',
						value: 'view',
					},
				],
				default: 'view',
				description: 'Scope under which the request is made; determines fields present in response',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                 tag:getAll                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Context',
				name: 'context',
				type: 'options',
				options: [
					{
						name: 'Edit',
						value: 'edit',
					},
					{
						name: 'Embed',
						value: 'embed',
					},
					{
						name: 'View',
						value: 'view',
					},
				],
				default: 'view',
				description: 'Scope under which the request is made; determines fields present in response',
			},
			{
				displayName: 'Hide Empty',
				name: 'hide_empty',
				type: 'boolean',
				default: false,
				description: 'Whether to hide terms not assigned to any posts',
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{
						name: 'ASC',
						value: 'asc',
					},
					{
						name: 'DESC',
						value: 'desc',
					},
				],
				default: 'asc',
				description: 'Order sort attribute ascending or descending',
			},
			{
				displayName: 'Order By',
				name: 'orderby',
				type: 'options',
				options: [
					{
						name: 'Count',
						value: 'count',
					},
					{
						name: 'Description',
						value: 'description',
					},
					{
						name: 'ID',
						value: 'id',
					},
					{
						name: 'Include',
						value: 'include',
					},
					{
						name: 'Include Slugs',
						value: 'include_slugs',
					},
					{
						name: 'Name',
						value: 'name',
					},
					{
						name: 'Slug',
						value: 'slug',
					},
					{
						name: 'Term Group',
						value: 'term_group',
					},
				],
				default: 'name',
				description: 'Sort collection by term attribute',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Limit results to those matching a string',
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'Limit result set to terms with one or more specific slugs',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                 tag:delete                                 */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['delete'],
			},
		},
		description: 'Unique identifier for the term',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['delete'],
			},
		},
		options: [
			{
				displayName: 'Force',
				name: 'force',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass trash and force deletion (required for terms)',
			},
		],
	},
];
