import apiFetch from "./api";

export interface SignupData {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
}

export const authApi = {
    signup: async (userData: SignupData): Promise<User> => {
        const response = await apiFetch("/auth/signup", {
            method: "POST",
            body: JSON.stringify(userData),
        });

        return response.json();
    },

    login: async (
        email: string,
        password: string
    ): Promise<User> => {
        const formData = new URLSearchParams();

        formData.append("username", email);
        formData.append("password", password);

        const resposne = await apiFetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData
        });

        return resposne.json();
    },

    logout: async (): Promise<void> => {
        await apiFetch("/auth/logout", {
            method: "POST",
        });
    },
    getCurrentUser: async (): Promise<User> => {
        const response = await apiFetch("/auth/me", {
        });

        return response.json();
    }
 }