import {Navigate} from 'react-router-dom';
import Cookie from 'js-cookie';

const ProtectedRoute = ({element}) => {

  const token = Cookie.get('jwt_token');
  console.log(token ,"protectedRoute")
  console.log(element)
  if (token === undefined) {
    return <Navigate to="/login" />;
  }
  return element;
};

export default ProtectedRoute;
