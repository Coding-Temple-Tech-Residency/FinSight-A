//Lives in the NavBar, directs to login page
import { Link } from "react-router-dom";

function LoginButton () {
    return (
        <Link to="/Login"
        className="bg-indigo-500 hover:bg-indigo-700 active:bg-indigo-900 text-white px-4 py-1 rounded-md transition focus:ring-2 focus:ring-indigo-400">
            Login
        </Link>
    )
}

export default LoginButton;