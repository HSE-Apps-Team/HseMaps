import React, { useContext, useState } from "react";
import {
    AppBar,
    Button,
    Tab,
    Tabs,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
  } from "@mui/material";
import AuthContext from '../Auth/AuthContext';

const Navbar= ({instance, loginRequest})=> {
    const { auth } = useContext(AuthContext);

    function signOut() {
        const logoutRequest = {
          account: instance.getAccountByHomeId(auth.user.homeAccountId),
          postLogoutRedirectUri: "https://google.com",
        };
        instance.logoutRedirect(logoutRequest);
      }

    function login(){
        instance.loginPopup(loginRequest).catch(e => {
                console.log(e+"login error");
            });
        }
  return (
    <div>
    <React.Fragment>
      <AppBar sx={{ background: "#FFFFFF" }}>
        <Toolbar>
         <Typography variant="h5" component="div" sx={{color:"black"}}>HSE Maps</Typography>
              <Tabs
                sx={{ marginLeft: "auto",marginRight:"auto" ,color:"black"}}
                indicatorColor="secondary"
                textColor="inherit"
                value={1}
              >
                <Tab label="Navigation" value={1}/>
                <Tab label="Schedule" value={2}/>
                <Tab label="Setting"value={3} />
              </Tabs>
                {auth.isAuth ? 
                <>
                <Typography variant="h7" component="div" sx={{color:"black"}} >{auth.user.displayName}</Typography>
                 <Button sx={{ marginRight: "10px",marginLeft:"10px"}} onClick={()=>signOut()} variant="contained">
                 Signout
               </Button>
               </>:
               <Button sx={{ marginLeft: "10px" }} onClick={()=>login()} variant="contained">
                Login
                </Button>
                
            
                }
             
         
        
        </Toolbar>
      </AppBar>
    </React.Fragment>
  
    </div>
  )
}

export default Navbar