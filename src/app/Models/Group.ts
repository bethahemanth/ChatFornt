export interface Group{
    group_id: number;
    owner_id: number;
    group_name: string;
    created_at: Date;
    unreadCount?: number;
    latestMessagePreview?: string;
    latestMessageTimestamp?: Date;
    profile_picture?: string;
}