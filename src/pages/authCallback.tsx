import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        // Example: grab first token/account
        const token1 = params.get('token1');
        const acct1 = params.get('acct1');

        if (token1 && acct1) {
            localStorage.setItem('deriv_token', token1);
            localStorage.setItem('deriv_account', acct1);
        }

        // ✅ Redirect to home after processing
        navigate('/');
    }, [location, navigate]);

    return <div>Redirecting to home…</div>;
};

export default AuthCallback;
