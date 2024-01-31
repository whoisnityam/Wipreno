export interface Notification {
    id: string;
    user_id: { id: string; first_name: string; last_name: string };
    consultation_id: {
        id: string;
        lot_id: { id: string; title: string };
        project_id: { id: string };
    };
    report_id: { id: string; project_id: { id: string } };
    seen: { user_id: { id: string } }[];
}
