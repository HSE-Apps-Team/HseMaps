import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../src/Auth/authConfig";
import axios from 'axios';
import Navbar from "../src/Components/Navbar";
import AuthContext from "../src/Auth/AuthContext";
import { Schedule } from './pages/Schedule';
import { Settings } from './pages/Settings';
import { Navigation } from './pages/Navigation';

function App() {
  const [auth, setAuth] = useState({
    isAuth: false,
  });
  const [activeTab, setActiveTab] = useState(1);
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

  const renderContent = () => {
    switch(activeTab) {
      case 1:
        return  <Navigation />
        ;
      case 2:
        return <Schedule />;
      case 3:
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Navbar 
        instance={instance}
        loginRequest={loginRequest}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {auth.isAuth ? 
        <div>
          {renderContent()}
        </div> :
        <div>
          {/* Login content */}
        </div>
      }
    </AuthContext.Provider>
  );
}

export default App;