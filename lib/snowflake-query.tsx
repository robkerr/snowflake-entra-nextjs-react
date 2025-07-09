export async function snowflakeQuery(sql_statement: string, token: string) {
    try {
        const snowflakeInstance = process.env.NEXT_PUBLIC_SNOWFLAKE_INSTANCE;
        const snowflakeDB = process.env.NEXT_PUBLIC_SNOWFLAKE_DB;
        const snowflakeSchema = process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA;
        const snowflakeWarehouse = process.env.NEXT_PUBLIC_SNOWFLAKE_WAREHOUSE;
        const snowflakeRole = process.env.NEXT_PUBLIC_SNOWFLAKE_ROLE;

        const url =`https://${snowflakeInstance}.snowflakecomputing.com/api/v2/statements`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            },
            body: JSON.stringify({
                "statement": sql_statement,
                "timeout": 60,
                "database": `${snowflakeDB}`,
                "schema": `${snowflakeSchema}`,
                "warehouse": `${snowflakeWarehouse}`,
                "role": `${snowflakeRole}`
              })
        });

        const response_json = await response.json();

        if (response.status != 200) {
            return {
                success: false,
                status: response.status,
                sql_status: response_json["code"],
                error: response_json["message"],
                headings: null,
                data: null
            }
        } else {
            return {
                success: true,
                status: response.status,
                sql_status: response_json["code"],
                error: null,
                headings: response_json["resultSetMetaData"]["rowType"].map((col: any) => col.name),
                data: response_json["data"] || null,
            };
        }
    } catch (err) {
        console.error("call failed:", err);
        let errorMessage: string;
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else {
            errorMessage = 'Unknown error';
        }
        return {
            "error": errorMessage
        };
    }
}
