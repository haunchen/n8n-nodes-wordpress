export interface IPost {
	date?: string;
	author?: number;
	id?: number;
	title?: string;
	content?: string;
	excerpt?: string;
	featured_media?: number;
	slug?: string;
	password?: string;
	status?: string;
	comment_status?: string;
	ping_status?: string;
	format?: string;
	sticky?: boolean;
	template?: string;
	categories?: number[];
	tags?: number[];
	meta?: { [key: string]: string };
}
