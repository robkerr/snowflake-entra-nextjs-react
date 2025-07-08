export interface RowData {
    [key: string]: string | number | boolean | null | undefined | object | Array<unknown>;
}

export interface ScrollableDataTableProps {
    headings: string[];
    data: RowData[];
    className?: string;
}
