import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../src/Auth/authConfig";
import {useState} from 'react';
import axios from 'axios';
import { useEffect } from "react";
import Navbar from "../src/Components/Navbar";
import AuthContext from "../src/Auth/AuthContext";

function App() {
  const [auth, setAuth] = useState({
    isAuth: false,
  });
  const { instance, accounts } = useMsal();


      useEffect(() => {
        if (accounts[0]) {
          instance
            .acquireTokenSilent({
              ...loginRequest,
              account: accounts[0],
            })
            .then((response) => {
              const resp = {...response.account, grade: parseInt(response.account.grade)}
              setAuth((prev) => ({
                ...prev,
                token: response.accessToken,
                user: resp,
              }));
    
              testToken(response.accessToken);
            });
        }
      }, [accounts]);

     
      const testToken = async (token) => {
        const res = await axios.get("https://graph.microsoft.com/v1.0/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (
          res.data.jobTitle === "12" ||
          res.data.jobTitle === "11" ||
          res.data.jobTitle ==="10" ||
          res.data.jobTitle === "9"
        ) {
          setAuth((prev) => ({
            ...prev,
            isAuth: true,
            user: {
              ...prev.user,
              role: "student",
              displayName: `${res.data.givenName} ${res.data.surname}`,
              grade: res.data.jobTitle,
            },
          }));
        }
      };

console.log(auth)
  return (
    
    <AuthContext.Provider value={{ auth, setAuth }}>
        <Navbar instance={instance} 
        loginRequest={loginRequest} />
      
        <h1>HSE AD Boilerplate</h1>
      {auth.isAuth ? 
                <div>
                 
                  <h1>{auth.user.role}</h1>
                  <h2>{"Name:" + auth.user.displayName}</h2>
                  <h2>{"Grade: " + auth.user.grade}</h2>
                  <h2>{"Email: " + auth.user.username}</h2>
                </div>  :

                <div>
                
                </div>
          }
    </AuthContext.Provider>
  );
}

export default App;