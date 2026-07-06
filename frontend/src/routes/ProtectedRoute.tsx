import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from 'react-router-dom';
import LoadingSpinner from "../components/LoadingSpinner";

function ProtectedRoute({children}: { children: React.ReactElement }) {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to='/' replace />
    }
    return children
}

export default ProtectedRoute;