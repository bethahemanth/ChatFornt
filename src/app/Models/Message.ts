import { Timestamp } from "rxjs"

export interface Message {
    message_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: Date; // Use Date for timestamps
    destroy_at: Date; // Use Date for timestamps
    isRead?:boolean;
    
}