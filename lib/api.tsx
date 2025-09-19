import { appInsights } from '@/components/appInsights';

export async function get_query(token: string): Promise<string> {
    try {
        
        const base_url = "https://fnapp-kla-inv-agent.azurewebsites.net" // process.env.NEXT_BASE_URL;

        const url =`${base_url}/api/getquery`;

        console.log("Calling API:", url);
        appInsights.trackEvent({ name: `Get Query API Call: ${url}`});

        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                "parm1": "value1" 
            })
        });

        const response_json = await response.json();

        console.log("API response:", response_json);

        return response_json["sql"];

    } catch (err) {
        console.error("call failed:", err);
        let errorMessage = "NO ERROR";
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else {
            errorMessage = 'Unknown error';
        }

        console.log("Error message:", errorMessage);
        return errorMessage;
    }
}
