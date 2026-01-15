import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_TIME = 60 * 1000; // Show warning 1 minute before logout

export const useIdleTimeout = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const handleLogout = useCallback(async () => {
    await signOut();
    toast({
      variant: "destructive",
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
    });
  }, [signOut, toast]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Session Expiring Soon",
        description: "You will be logged out in 1 minute due to inactivity. Move your mouse or press a key to stay logged in.",
      });
    }
  }, [toast]);

  const resetTimer = useCallback(() => {
    warningShownRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (user) {
      // Set warning timer
      warningRef.current = setTimeout(() => {
        showWarning();
      }, IDLE_TIMEOUT - WARNING_TIME);

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, IDLE_TIMEOUT);
    }
  }, [user, handleLogout, showWarning]);

  useEffect(() => {
    if (!user) return;

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initial timer setup
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [user, resetTimer]);

  return { resetTimer };
};
