import { useAuth } from '../context/AuthContext';


function LoginPage() {

    const { login } = useAuth();

    return (
        <div>
            <h1>FinSight Dashboard</h1>

            <button className="bg-indigo-600 hover:bg-indigot-800 text-white font-semibold px-4 py-2 rounded-md transition"
            onClick={login}>Sign In</button>

        </div>
    );
}

export default LoginPage;

