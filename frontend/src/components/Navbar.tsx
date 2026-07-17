import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import SignupButton from "./SignupButton";

function Navbar() {
    const { user } = useAuth();
    return (
        <nav className='bg-gray-900 text-white px-6 py-4'>
            <div className='max-w-7xl mx-auto flex items-center justify-between'>
                <div className='text-xl font-bold'>
                    FinSight
                </div>

                <div className="flex gap-6">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to='/market-trends'>Market Trends</Link>
                    <Link to='/profile'>Profile</Link>
                    <Link to='/watchlist'>Watchlist</Link>
                    <Link to='/chat'>AI Chat</Link>
                </div>
                <div className="flex items-center gap-4">

                    {user && (
                        <span>{user?.email}</span>
                    )}
                    {user ? (
                        <LogoutButton />
                    ) : (
                        <>
                        <SignupButton />
                        <LoginButton />
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
