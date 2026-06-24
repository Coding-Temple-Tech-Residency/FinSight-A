//Lives in NavBar, only appears after login
import { useAuth0 } from "@auth0/auth0-react";

function LogoutButton () {
    const { logout } = useAuth0();

    return (
        <button className="bg-red-600 hover:bg-red-800 active:bg-red-900 text-black px-4 py-2 rounded-md transistion focus:ring-2 focus:ring-red-400"
            onClick ={() => 
                logout({
                    logoutParams: {
                        returnTo: window.location.origin,
                    },
                })
            }
        >

            Log Out

        </button>
    )

}

export default LogoutButton;