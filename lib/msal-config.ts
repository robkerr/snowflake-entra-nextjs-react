import { Configuration, PopupRequest, RedirectRequest } from '@azure/msal-browser';

// Safe environment variable validation with fallbacks
const validateEnvVars = () => {
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
  
  // Enhanced logging for debugging
  console.log('🔍 MSAL Environment Variable Check:', {
    clientId: clientId ? `${clientId.substring(0, 8)}...` : '❌ MISSING',
    tenantId: tenantId ? `${tenantId.substring(0, 8)}...` : '❌ MISSING',
    origin: typeof window !== 'undefined' ? window.location.origin : '🖥️ SERVER',
    timestamp: new Date().toISOString()
  });
  
  // Validate clientId
  if (!clientId || clientId.trim() === '') {
    const error = '❌ NEXT_PUBLIC_AZURE_CLIENT_ID environment variable is not set or empty';
    console.error(error);
    throw new Error(error);
  }
  
  // Validate tenantId
  if (!tenantId || tenantId.trim() === '') {
    const error = '❌ NEXT_PUBLIC_AZURE_TENANT_ID environment variable is not set or empty';
    console.error(error);
    throw new Error(error);
  }
  
  // Validate clientId format (should be a GUID)
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!guidRegex.test(clientId.trim())) {
    const error = `❌ NEXT_PUBLIC_AZURE_CLIENT_ID appears to be invalid format. Expected GUID, got: ${clientId.substring(0, 8)}...`;
    console.error(error);
    throw new Error(error);
  }
  
  if (!guidRegex.test(tenantId.trim())) {
    const error = `❌ NEXT_PUBLIC_AZURE_TENANT_ID appears to be invalid format. Expected GUID, got: ${tenantId.substring(0, 8)}...`;
    console.error(error);
    throw new Error(error);
  }
  
  console.log('✅ Environment variables validated successfully');
  
  return { 
    clientId: clientId.trim(), 
    tenantId: tenantId.trim() 
  };
};

// Safe initialization with error handling
let msalConfig: Configuration;
let loginRequest: PopupRequest;
let loginRedirectRequest: RedirectRequest;

try {
  // Get validated environment variables
  const { clientId, tenantId } = validateEnvVars();

  msalConfig = {
    auth: {
      clientId, // Use validated and trimmed clientId
      authority: `https://login.microsoftonline.com/${tenantId}`, // Use validated and trimmed tenantId
      redirectUri: typeof window !== 'undefined' ? window.location.origin : '', 
      postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    },
    cache: {
      cacheLocation: 'sessionStorage', // Keep existing cache settings
      storeAuthStateInCookie: false, // Keep existing setting
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case 0: // LogLevel.Error
              console.error('🔴 MSAL Error:', message);
              return;
            case 1: // LogLevel.Warning
              console.warn('🟡 MSAL Warning:', message);
              return;
            case 2: // LogLevel.Info
              console.info('🔵 MSAL Info:', message);
              return;
            case 3: // LogLevel.Verbose
              console.debug('⚪ MSAL Debug:', message);
              return;
            default:
              return;
          }
        },
        logLevel: 2, // Keep existing log level
      },
      windowHashTimeout: 60000, // Keep existing timeouts
      iframeHashTimeout: 6000,
      loadFrameTimeout: 0,
      asyncPopups: false, // Keep existing setting
    },
  };

  loginRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email'], // Keep existing scopes
    prompt: 'select_account', // Keep existing prompt
  };

  loginRedirectRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email'], // Keep existing scopes
    prompt: 'select_account', // Keep existing prompt
  };

  console.log('✅ MSAL configuration initialized successfully');

} catch (error) {
  console.error('🚨 CRITICAL: MSAL configuration failed:', error);
  
  // Fallback configuration to prevent complete app failure
  // This will still fail at runtime but won't crash the module loading
  console.warn('⚠️ Using fallback MSAL configuration - authentication will not work until environment variables are fixed');
  
  msalConfig = {
    auth: {
      clientId: 'CONFIGURATION_ERROR', // Will cause auth to fail gracefully
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
      postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (!containsPii) {
            console.log(`MSAL Fallback [${level}]:`, message);
          }
        },
        logLevel: 2,
      },
    },
  };

  loginRequest = {
    scopes: ['User.Read'],
  };

  loginRedirectRequest = {
    scopes: ['User.Read'],
  };
}

// Export the configurations (keeping the same export names)
export { msalConfig, loginRequest, loginRedirectRequest };

// Keep existing graphConfig export
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// Export a helper function to check if configuration is valid
export const isMsalConfigValid = (): boolean => {
  return msalConfig.auth.clientId !== 'CONFIGURATION_ERROR';
};