import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            await login(email, password);

            navigate('/dashboard')
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : 'Login failed'
            );
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='bg-slate-900 min-h-screen'> 
            <h1 className='text-slate-50 p-8 text-center text-4xl font-bold'>FinSight Dashboard Login</h1>
            <div className='flex items-center justify-center'>
                <form
                onSubmit={handleSubmit}
                className='w-full max-w-md rounded-lg bg-slate-50 p-8 shadow-md'
                >
                    <h2 className='mb-6 text-2xl font-bold'>
                        Login
                    </h2>
                    {error && (
                        <p className='mb-4 text-red-600'>
                            {error}
                        </p>
                    )}
                    <label className='mb-2 block'>
                        Email
                    </label>
                    <input
                    type='email'
                    value={email}
                    onChange={(e) => 
                        setEmail(e.target.value)
                    }
                    className='mb-4 w-full rounded border p-2' required
                    />

                    <label className='mb-2 block'>
                        Password
                    </label>
                    <input
                    type='password'
                    value={password}
                    onChange={(e) => 
                        setPassword(e.target.value)
                    }
                    className='mb-6 w-full rounded border p-2' required
                    />
                    <button 
                    type='submit'
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-md transition"
                    >
                    {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
            

        </div>
    );
}

export default LoginPage;

