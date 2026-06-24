import { useAuth } from '../context/AuthContext';


function LoginPage() {

    const { login } = useAuth();

    return (
        <div>
            <h1>FinSight Dashboard</h1>

            <button onClick={login}>Sign In</button>

        </div>
    );
}

export default LoginPage;

