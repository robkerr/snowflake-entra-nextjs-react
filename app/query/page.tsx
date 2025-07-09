
"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { RowData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

// Dynamically import the ScrollableDataTable component for client-side rendering only
const ScrollableDataTable = dynamic(() => import("@/components/scrollable-data-table"), { ssr: false });
import { useMsal } from "@azure/msal-react";
// import { BrowserUtils } from "@azure/msal-browser";
import { snowflakeQuery } from '@/lib/snowflake-query';
import { isUserLoggedIn, verifyLogin, getAccessToken } from "@/lib/msal-helper";
import type { VerifyLoginResult } from "@/lib/types";

export default function ChatPage() {
  // Query input from user
  const defaultQuery = process.env.NEXT_PUBLIC_DEFAULT_QUERY ?? "";
  const [input, setInput] = useState(defaultQuery);

  // Output column headings and data from Snowflake
  const [headings, setHeadings] = useState<string[]>([]);
  const [entries, setEntries] = useState<RowData[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  //Get Reference to global MSAL instance
  const { instance } = useMsal();

  
  // const [tokenIssuance, setTokenIssuance] = useState(null);
  // const [tokenExpiration, setTokenExpiration] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  async function submitQuery(sql: string): Promise<boolean> {

    const accessToken = await getAccessToken(instance, process.env.NEXT_PUBLIC_SNOWFLAKE_SCOPE);

    if (!accessToken) {
      console.error("No access token available.");
      return false;
    }

    try {
      // Check if the SQL statement is empty or only whitespace
      const response = await snowflakeQuery(sql, accessToken);
      console.log('Response from Snowflake:', response.data);

      if (!response || !response.data) {
        console.error("No SQL response received.");
        return false;
      } else {
        setEntries(response.data);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const columns = response["resultSetMetaData"]["rowType"].map((col: any) => col.name);
        console.log("Columns:", columns);
        setHeadings(columns);
        
        return true;
      }
    } catch (error) {
      console.error("Error executing SQL query:", error);
      return false;
    }
  }

  async function loginOrGetUserInfo() {
    // Verify login, display login popup if needed
    const verifyResult = await verifyLogin(instance, process.env.NEXT_PUBLIC_SNOWFLAKE_SCOPE);

    if (!verifyResult.success) {
      console.error("Login verification failed:", verifyResult.message);
      setUserDisplayName(null); // Clear display name on failure
      toast({
        title: "Entra Authentication Error",
        description: verifyResult.message,
        variant: "destructive",
      });
    } else {
      setUserDisplayName(verifyResult.displayName);
      toast({
        title: "Entra Authentication Success",
        description: verifyResult.message
      });
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      // Configuation check
      if (!instance) {
        const errorMessage = "MSAL instance is not available in useEffect.";
        console.error(errorMessage);
        setUserDisplayName(null); // Clear display name on failure
        toast({
          title: "Entra Configuration Error",
          description: "MSAL instance is not available. Please check your configuration.",
          variant: "destructive",
        });
      }

      const loggedIn = await isUserLoggedIn(instance);
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        loginOrGetUserInfo();
      }
    }

    checkLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, toast]);

  


  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== "") {
        handleGo();
      }
    }
  }

  async function handleGo() {
    if (input.trim() === "") return;

    const success = await submitQuery(input);
    
    if (!success) {
      // If the query failed, we can show an error message or reset the input
      console.error("Query execution failed.");
      setHeadings([]); // Clear headings on error
      setEntries([]); // Clear entries on error
      return;
    } 

    setInput(defaultQuery); // Reset input to default query
    if (textareaRef.current) textareaRef.current.focus();
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a66c2] via-[#004182] to-[#002447]">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-[#0077b5]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[80vw]" style={{ minWidth: 0 }}>
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Snowflake OAuth Integration Test
            </h1>
            <p className="text-white/80 text-lg font-medium">
              Experiment with text input and stats
            </p>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm p-8 border-b border-white/20">
              <h2 className="text-2xl font-semibold text-white text-center">
                Send SQL Statement to Snowflake
              </h2>
              <p className="text-white/70 text-center mt-2">
                Enter a query against the SHIP_PLAN table to test OAuth.
              </p>
            </div>

            {/* Card Content */}
            <div className="p-8 space-y-6">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 resize-vertical p-3 rounded-2xl bg-white/20 text-white placeholder-white/60 font-medium text-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] backdrop-blur-md shadow-inner min-h-[60px]"
                  style={{ minHeight: 60 }}
                />
                <button
                  onClick={handleGo}
                  disabled={input.trim() === ""}
                  className="h-12 min-w-[60px] px-6 rounded-2xl bg-gradient-to-r from-white to-white/90 text-[#0a66c2] font-semibold text-lg shadow-xl border-0 transition-all duration-300 transform hover:scale-[1.04] hover:from-white/90 hover:to-white/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Go
                </button>
              </div>

              {entries.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mt-6 overflow-x-auto">
                  <ScrollableDataTable headings={headings} data={entries} />
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm p-6 border-t border-white/10">
              <p className="text-white/60 text-xs text-center">
                This is a demo playground. Your text is not saved.
              </p>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
            <a
                href="https://robkerr.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/80 transition-colors"
            >
                For more info visit robkerr.ai
            </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
