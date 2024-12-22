import { GoogleOAuthProvider } from "@react-oauth/google";

import React from "react";
import Login from "./pages/Login";

const App = () => {
  return (
    <>
      <GoogleOAuthProvider clientId="293743201897-3luvrfqfc6ipgrjjgchsinrfkggsbvhr.apps.googleusercontent.com">
        <Login />
      </GoogleOAuthProvider>
      
    </>
  );
};

export default App;
