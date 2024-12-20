import { GoogleOAuthProvider } from '@react-oauth/google';


import React from 'react'
import Login from './pages/Login';

const App = () => {
  return (
    <>
    
 <GoogleOAuthProvider clientId="<your_client_id>">
  <Login/>

 </GoogleOAuthProvider>;
    </>  )
}

export default App