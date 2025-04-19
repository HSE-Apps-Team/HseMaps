/**
 * @module Navbar
 * @description Navigation bar component with authentication integration
 */
import React, { useContext, useCallback } from "react";
import { AppBar, Button, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import AuthContext from '../Auth/AuthContext';

// ...existing imports...
import { useMediaQuery } from "@mui/material";

// ...existing code...
export const Navbar = ({ instance, loginRequest, activeTab, setActiveTab }) => {
    const { auth } = useContext(AuthContext);

    // Detect if the screen size is small (mobile)
    const isMobile = useMediaQuery("(max-width:600px)");

    const signOut = useCallback(() => {
        const logoutRequest = {
            account: instance.getAccountByHomeId(auth.user.homeAccountId),
            postLogoutRedirectUri: "https://google.com",
        };
        instance.logoutRedirect(logoutRequest);
    }, [instance, auth.user]);

    const login = useCallback(() => {
        instance.loginRedirect(loginRequest).catch(e => {
            console.error("Login failed:", e);
        });
    }, [instance, loginRequest]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <div>
            <React.Fragment>
                <AppBar sx={{ background: "#FFFFFF" }}>
                    <Toolbar>
                        {isMobile ? (
                            <>
                            <Typography variant="h4" component="div" sx={{ color: "black" }} position={"absolute"}> 
                               
                            </Typography>
                            <Tabs
                            sx={{ marginLeft: "auto", marginRight: "auto", color: "black" }}
                            x={5}
                            indicatorColor="secondary"
                            textColor="inherit"
                            value={activeTab}
                            onChange={handleTabChange}
                        >
                            <Tab label="Navigation" value={1} />
                            <Tab label="Schedule" value={2} />
                            <Tab label="Settings" value={3} />
                        </Tabs>
                        </>
                        ) : (
                            // Render the full navbar for larger screens
                            <>
                                <Typography variant="h5" component="div" sx={{ color: "black" }}>
                                    HSE Maps
                                </Typography>
                                <Tabs
                                    sx={{ marginLeft: "auto", marginRight: "auto", color: "black" }}
                                    indicatorColor="secondary"
                                    textColor="inherit"
                                    value={activeTab}
                                    onChange={handleTabChange}
                                >
                                    <Tab label="Navigation" value={1} />
                                    <Tab label="Schedule" value={2} />
                                    <Tab label="Settings" value={3} />
                                </Tabs>
                            </>
                        )}
                        {auth.isAuth ? (
                            <>
                                {!isMobile && (
                                    <Typography variant="h7" component="div" sx={{ color: "black" }}>
                                        {auth.user.displayName}
                                    </Typography>
                                )}
                                <Button
                                    sx={{ marginRight: "10px", marginLeft: "10px" }}
                                    onClick={signOut}
                                    variant="contained"
                                >
                                    Signout
                                </Button>
                            </>
                        ) : (
                            <Button sx={{ marginLeft: "10px" }} onClick={login} variant="contained">
                                Login
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        </div>
    );
};

export default React.memo(Navbar);