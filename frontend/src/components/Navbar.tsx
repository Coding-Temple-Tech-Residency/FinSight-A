import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";

function Navbar() {
    const { isAuthenticated, user } = useAuth0();
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



// function Navbar() {
//     const { isAuthenticated, isLoading, user } = useAuth0();

//     console.log({
//         isLoading,
//         isAuthenticated,
//         user,
//     })

//     return (
//         <nav className='bg-slate-900 text-white px-6 py-4'>
//             <div className='max-w-7xl mx-auto flex items-center justify-between'>
                
//                 {/*Logo */}
//                 <div className='text-xl font-bold'>
//                     FinSight
//                 </div>

//                 {/*Links */}
//                 <div className='flex gap-6'>
//                     <a href="/dashboard" className="hover:text-blue-400 transition">
//                     Dashboard
//                     </a>
                    
//                     <a href="/watchlist" className="hover:text-blue-400 transition">
//                     Watchlist
//                     </a>

//                     <a href="/portfolio" className="hover:text-blue-400 transition">
//                     Portfolio
//                     </a>

//                     <a href="/profile" className="hover:text-blue-400 transition">
//                     Profile
//                     </a>
                    
//                 </div>
//                 <div>
//                     {isAuthenticated ? (
//                     <LogoutButton />
//                     ): (<LoginButton />)}
                    
//                 </div>
                
//             </div>
//         </nav>
//     )
// }

// export default Navbar;