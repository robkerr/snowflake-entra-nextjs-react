
export type VerifyLoginResult = {
    success: boolean;
    message: string;
    displayName: string;
};
export interface RowData {
    [key: string]: string | number | boolean | null | undefined | object | Array<unknown>;
}

export interface ScrollableDataTableProps {
    headings: string[];
    data: RowData[];
    className?: string;
}
