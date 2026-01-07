export interface ITag {
	id?: number;
	name?: string;
	description?: string;
	slug?: string;
	count?: number;
	meta?: { [key: string]: string };
}
