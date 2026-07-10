import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegistrationPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ){
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try{
            setError('');
            setLoading(true);

            await signup(email, password)

            navigate('/dashboard');
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : 'Registration failed'
            );
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center">
            <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
            >
                <h1 className="mb-6 text-2xl font-bold">
                    Create Account
                </h1>
                {error && (
                    <p className="mb-4 text-red-600">
                        {error}
                    </p>
                )}
                <label className="mb-2 block">
                    Email
                </label>
                <input
                type='email'
                value={email}
                onChange={(e) => 
                    setEmail(e.target.value)
                }
                className="mb-4 w-full rounded border p-2"
                required
                />
                <label className="mb-2 block">
                    Password
                </label>

                <input
                type='password'
                value={password}
                onChange={(e) => 
                    setPassword(e.target.value)
                }
                className="mb-4 w-full rounded border p-2"
                required
                />
                <label className="mb-2 block">
                    Confirm Password
                </label>

                <input
                type='password'
                value={confirmPassword}
                onChange={(e) => 
                    setConfirmPassword(e.target.value)
                }
                className="mb-6 w-full rounded border p-2"
                required
                />
                <button
                type='submit'
                disabled={loading}
                className="w-full rounded bg-cyan-400 px-4 py-2 text-white hover:bg-cyan-600 disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
        </div>
    )
}

export default RegistrationPage;