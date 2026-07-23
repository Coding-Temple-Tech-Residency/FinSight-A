//Lives in NavBar, only appears after login
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogoutButton () {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <button className="cursor-pointer bg-red-600 hover:bg-red-800 active:bg-red-900 text-black px-4 py-1 rounded-md transistion focus:ring-2 focus:ring-red-400"
            onClick ={handleLogout}
        >
            Log Out
        </button>
    )

}

export default LogoutButton;