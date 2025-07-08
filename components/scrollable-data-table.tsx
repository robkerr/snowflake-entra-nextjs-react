"use client";
import React from "react";



import type { ScrollableDataTableProps } from "@/lib/types";

export default function ScrollableDataTable({ data, className = "" }: ScrollableDataTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className={`w-full text-center text-white/70 py-8 ${className}`}>No data to display.</div>
        );
    }

    // Get all unique keys from all objects (to support sparse/uneven data)
    const keySet = new Set<string>();
    data.forEach((obj) => {
        Object.keys(obj).forEach((k) => keySet.add(k));
    });
    const allKeys = Array.from(keySet);

    return (
        <div className={`overflow-x-auto w-full ${className}`} style={{ maxHeight: 400 }}>
            <table className="min-w-full text-white/90 text-base table-fixed border-separate border-spacing-0">
                <thead>
                    <tr>
                        {allKeys.map((key) => (
                            <th key={key} className="sticky top-0 bg-[#0a66c2] text-white font-semibold p-2 border-b border-white/20 z-10 text-left">
                                {key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="border-t border-white/10">
                            {allKeys.map((key) => (
                                <td key={key} className="p-2 align-top max-w-[200px] break-words border-b border-white/10">
                                    {row[key] !== undefined && row[key] !== null ? JSON.stringify(row[key]) : ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
