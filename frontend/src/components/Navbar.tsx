import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";

function Navbar() {
    const { isAuthenticated, user } = useAuth0();
    return (
        <nav className='bg-gray-900 text-white px-6 py-4'>
            <div className='max-w-7xl mx-auto flext items-center justify-between'>
                <div className='text-xl font-bold'>
                    FinSight
                </div>

                <div className="flex gap-6">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to='/profile'>Profile</Link>
                    <Link to='/watchlist'>Watchlist</Link>
                </div>
                <div>

                    {isAuthenticated && (
                        <span>{user?.name}</span>
                    )}
                    {isAuthenticated ? (
                        <LogoutButton />
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;