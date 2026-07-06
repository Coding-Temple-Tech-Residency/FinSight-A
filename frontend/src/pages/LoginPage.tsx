import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
//import { useAuth } from '../context/AuthContext';


function LoginPage() {

    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && isAuthenticated) {
            navigate("/dashboard", {replace: true})
        }
    }, [isAuthenticated, isLoading, navigate])
    return (
        <div>
            <h1>FinSight Dashboard</h1>

            <button className="bg-indigo-600 hover:bg-indigot-800 text-white font-semibold px-4 py-2 rounded-md transition"
            onClick={() => loginWithRedirect()}>Sign In</button>

            <LogoutButton />

        </div>
    );
}

export default LoginPage;

