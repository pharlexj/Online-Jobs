import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Disable automatic mounting fetch
    refetchInterval: false,
    refetchIntervalInBackground: false,
    staleTime: Infinity, // Cache forever until manually invalidated
    enabled: false, // Disable automatic fetching - only fetch when needed
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
