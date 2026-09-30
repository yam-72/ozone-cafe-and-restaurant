import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("ozone_user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [accessToken, setAccessToken] =
    useState(() => {
      return localStorage.getItem(
        "ozone_access_token"
      );
    });

  const [refreshToken, setRefreshToken] =
    useState(() => {
      return localStorage.getItem(
        "ozone_refresh_token"
      );
    });

  const isAuthenticated =
    Boolean(accessToken && user);

  const loginUser = ({
    accessToken,
    refreshToken,
    user,
  }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    localStorage.setItem(
      "ozone_access_token",
      accessToken
    );

    localStorage.setItem(
      "ozone_refresh_token",
      refreshToken
    );

    localStorage.setItem(
      "ozone_user",
      JSON.stringify(user)
    );
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    localStorage.removeItem(
      "ozone_access_token"
    );

    localStorage.removeItem(
      "ozone_refresh_token"
    );

    localStorage.removeItem(
      "ozone_user"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}