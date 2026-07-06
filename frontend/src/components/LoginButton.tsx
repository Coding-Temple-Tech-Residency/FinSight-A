//Lives in the NavBar, directs to login page
import { useAuth0 } from "@auth0/auth0-react";

function LoginButton () {
    const { loginWithRedirect } = useAuth0();

    return (
        <button className="bg-indigo-600 hover:bg-indigo-800 acitive:bg-indigo-900 text-white font-semibold px-4 py-2 rounded-md transition"
        onClick={() => loginWithRedirect({
            appState: {
                returnTo: '/dashboard',
            },
        }) 
        }>
            Log In
        </button>
    );
}

export default LoginButton;