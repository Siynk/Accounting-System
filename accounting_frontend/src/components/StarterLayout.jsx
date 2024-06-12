import { Outlet, Navigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';
import logo from '../assets/logo-removebg-preview.png';
import background from '../assets/5011342.jpg';
import '../css/login.css';


function StarterLayout() {
    let { token } = useStateContext();

    if (token) {
        return <Navigate to={'/dashboard'} />;
    }

    return (
        <div className="starter-layout" style={{ backgroundImage: `url(${background})` }}>
            <div className="content">
                <div className="logo-container">
                    {/* Place your logo here */}
                    <img src={logo} alt="Logo" />
                </div>
                <div className="login-outlet" >
                    <Outlet />
                </div>

            </div>
        </div>
    );
}

export default StarterLayout;
