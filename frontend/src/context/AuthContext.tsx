import { createContext, useContext, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    isLoading: boolean,
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children } : { children: ReactNode;}) {
    const {
        user,
        isAuthenticated,
        isLoading,
        loginWithRedirect,
        logout
    } = useAuth0();

    return (
        <AuthContext.Provider 
        value={{user, 
                isAuthenticated, 
                isLoading, 
                login: loginWithRedirect, 
                logout: () => logout({logoutParams: { returnTo: window.location.origin},}),}}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context=useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}