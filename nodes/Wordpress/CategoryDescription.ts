import type { INodeProperties } from 'n8n-workflow';

export const categoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a category',
				action: 'Create a category',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a category',
				action: 'Delete a category',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a category',
				action: 'Get a category',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many categories',
				action: 'Get many categories',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a category',
				action: 'Update a category',
			},
		],
		default: 'create',
	},
];

export const categoryFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                              category:create                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
				displayName: 'Parent Name or ID',
				name: 'parent',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description:
					'The parent term ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	/*                              category:update                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
				displayName: 'Parent Name or ID',
				name: 'parent',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description:
					'The parent term ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	/*                                category:get                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
	/*                              category:getAll                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
				resource: ['category'],
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
				displayName: 'Parent',
				name: 'parent',
				type: 'number',
				default: 0,
				description: 'Limit result set to terms assigned to a specific parent',
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
	/*                              category:delete                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['category'],
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
				resource: ['category'],
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
