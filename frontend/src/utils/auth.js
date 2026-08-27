// Simple auth utility to retrieve JWT token from storage
// Checks both localStorage and sessionStorage for common token keys.
export const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    sessionStorage.getItem("access") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
};
