import { IPublicClientApplication, InteractionStatus } from "@azure/msal-browser";

// Returns null if already logged in or user logs in here, otherwise returns an error message
export async function verifyLogin(instance: IPublicClientApplication, requestedScopes: string[] | string | undefined): Promise<string | null> {
    const isInProgress = sessionStorage.getItem("msal.interaction.status") === InteractionStatus.InProgress;
    if (isInProgress) {
        console.warn("Login is already in progress, skipping verification.");
        return null; // Skip verification if login is already in progress
    }
    // build scopes
    let scopes = ["User.Read"];

    // Add scope or scopes if passed to this routine
    if (typeof requestedScopes === "string") {
        scopes.push(requestedScopes.trim());
    } else if (Array.isArray(requestedScopes)) {
        scopes = scopes.concat(requestedScopes);
    }

    console.log("Checking login status...");
    let activeAccount = instance.getActiveAccount(); 

    if (activeAccount) {
        console.log("User is already logged in:", activeAccount)
        return null; // Already logged in
    } else {
        try {
            let response = null;

            // Try to use silent login, if unable then use a popup as fallback
            try {
                // Try silent login first
                console.info("Attempt sileng login first");
                response = await instance.ssoSilent({
                    scopes: scopes, // Replace with your required scopes
                });
            } catch (error) {
                console.info("Silent login failed, falling back to popup", error);
                response = await instance.loginPopup({
                    scopes: scopes,
                });
            } 

            console.log("Login response:", response);
            if (response && response.account) {
                activeAccount = response.account;
                instance.setActiveAccount(activeAccount);
                console.log("User logged in successfully:", activeAccount);
                return null; // Successfully logged in
            } else {
                const errorMessage = "No account found after login.";
                console.error(errorMessage);
                return errorMessage;
            }

        } catch (error) {
            const errorMessage = "Login failed: " + (error as Error).message;
            console.error(errorMessage);
            return errorMessage;
        }
    }
}

// Function to get access token silently for a given scope
export async function getAccessToken(instance: IPublicClientApplication, scope: string | undefined): Promise<string | null> {
    if (!instance) {
      console.error("MSAL instance is not available.");
      return null;
    }

    if (typeof scope === "undefined") {
      console.error("Scope is undefined.");
      return null;
    }

    if (!scope) {
      console.error("No scope provided for token acquisition.");
      return null;
    }

    const activeAccount = instance.getActiveAccount();

    if (!activeAccount) {
      console.error("No active account found.");
      return null;
    }

    try {
      const request = {
        scopes: [scope],
        account: activeAccount,
      };
      const authResult = await instance.acquireTokenSilent(request);
      return authResult.accessToken;
    } catch (error) {
      console.error("Failed to acquire token silently:", error);
      return null;
    }
  }