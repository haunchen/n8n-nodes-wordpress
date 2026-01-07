export interface ICategory {
	id?: number;
	name?: string;
	description?: string;
	slug?: string;
	parent?: number;
	count?: number;
	meta?: { [key: string]: string };
}
