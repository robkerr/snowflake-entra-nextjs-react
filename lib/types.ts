export interface RowData {
    [key: string]: string | number | boolean | null | undefined | object | Array<unknown>;
}

export interface ScrollableDataTableProps {
    data: RowData[];
    className?: string;
}
