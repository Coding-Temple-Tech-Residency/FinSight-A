import { Link } from "react-router-dom";

function SignupButton() {
    return (
        <Link
        to="/signup"
        className="bg-sky-400 hover:bg-sky-600 active:bg-sky-600 texxt-white px-4 py-1 rounded-md transition focus:ring-2 foucs:ring-cyan-400 "
        >
            Sign Up
        </Link>
    )
}

export default SignupButton;