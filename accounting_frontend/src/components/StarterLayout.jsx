import { Outlet, Navigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
function StarterLayout() {
    let { token } = useStateContext();

    if (token) {
        return <Navigate to={'/dashboard'} />
    }

    return (
        <>
            <Outlet />
        </>
    )
}

export default StarterLayout
