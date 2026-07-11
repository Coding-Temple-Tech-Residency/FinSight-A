import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {authApi, User} from '../services/authApi';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean,
    login: (
        email: string,
        password: string,
    ) => Promise<void>;
    signup: (
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children, } : AuthProviderProps ) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
    async function loadUser() {
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }
    loadUser();
   }, []);

   async function login (
    email: string,
    password: string,
   ) {
    const loggedInUser = await authApi.login(
        email, 
        password
    );

    setUser(loggedInUser);
   }

   async function signup(
    email: string,
    password: string,
   ) {
    const newUser = await authApi.signup({
        email,
        password,
    });
    setUser(newUser);
   }

   async function logout() {
    await authApi.logout();
    setUser(null);
   }



    return (
        <AuthContext.Provider 
        value={{user, 
            isAuthenticated: user !== null,
            loading,
            login,
            signup,
            logout,
                }}
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