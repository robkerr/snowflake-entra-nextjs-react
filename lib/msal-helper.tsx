import { IPublicClientApplication, InteractionStatus } from "@azure/msal-browser";

// Returns null if already logged in or user logs in here, otherwise returns an error message
import type { VerifyLoginResult } from "@/lib/types";

export async function verifyLogin(
    instance: IPublicClientApplication,
    requestedScopes: string[] | string | undefined
): Promise<VerifyLoginResult> {
    let scopes = ["User.Read"];

    if (typeof requestedScopes === "string") {
        scopes.push(requestedScopes.trim());
    } else if (Array.isArray(requestedScopes)) {
        scopes = scopes.concat(requestedScopes);
    }

    console.log("Checking login status...");
    let activeAccount = instance.getActiveAccount();

    if (activeAccount) {
        console.log("User is already logged in:", activeAccount);

        return {
            success: true,
            message: "User is already logged in.",
            displayName: activeAccount.idTokenClaims?.name ?? "Unknown User",
        };
    } else {
        try {
            let response = null;

            try {
                console.info("Attempt silent login first");
                response = await instance.ssoSilent({
                    scopes: scopes,
                });
            } catch (error) {
                console.info("Silent login failed, falling back to popup", error);
                response = await instance.loginPopup({
                    scopes: scopes,
                });
            }

            console.log("Login response:", response);
            if (response !== undefined && response && response.account) {
                const displayName = response?.account?.idTokenClaims?.name ?? "Unknown User";

                activeAccount = response.account;
                instance.setActiveAccount(activeAccount);
                console.log("User logged in successfully:", activeAccount);
                return {
                    success: true,
                    message: "User logged in successfully.",
                    displayName,
                };
            } else {
                const errorMessage = "No account found after login.";
                console.error(errorMessage);
                return {
                    success: false,
                    message: errorMessage,
                    displayName: "",
                };
            }
        } catch (error) {
            const errorMessage = "Login failed: " + (error as Error).message;
            console.error(errorMessage);
            return {
                success: false,
                message: errorMessage,
                displayName: "",
            };
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