import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from '@react-oauth/google';

import React from "react";

const Login = () => {
  return (
    <>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
      ;
    </>
  );
};

export default Login;
