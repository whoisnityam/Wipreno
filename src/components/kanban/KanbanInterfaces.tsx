export interface Item {
    id: string;
    name: string;
    status: string;
    assignee: string;
}
export interface ColumnLayout {
    ColumnID: string;
    ColumnName: string;
    items: Item[];
}
