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

  return (
    
    <AuthContext.Provider value={{ auth, setAuth }}>
        <Navbar instance={instance} 
        loginRequest={loginRequest} />
      
      {auth.isAuth ? 
                <div>
                 
                  
                </div>  :

                <div>
                
                </div>
          }
    </AuthContext.Provider>
  );
}

export default App;