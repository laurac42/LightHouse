export type TagCount = {
    tag_id: number;
    name: string;
    count: number;
    user_applied: boolean;
}

export type Tag = {
    id: number;
    name: string;
    is_seed: boolean;
}