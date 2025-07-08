export async function snowflakeQuery(sql_statement: string, token: string) {
    try {
        const url = 'https://gjcdsmk-cua46455.snowflakecomputing.com/api/v2/statements';

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
                "database": "DW",
                "schema": "PUBLIC",
                "warehouse": "COMPUTE_WH",
                "role": "DW_USERS",
                "bindings": {
                  "1": {
                    "type": "TEXT",
                    "value": "EU"
                  }
                }
              })
        });

        const response_json = await response.json();

        if (response.status != 200) {
            throw new Error(response_json.error);
        }

        return response_json;
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
