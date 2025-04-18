import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import './Settings.css';

export const Settings = () => {
  const [theme, setTheme] = useState('light');

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleCheckChange = (event) => {
    localStorage.useRotate = document.getElementById("rotate-toggle").checked;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Container>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <div className="settings-container">
          <div className="setting-item">
            <label htmlFor="theme-dropdown">Color Theme:</label>
            <select 
              id="theme-dropdown"
              value={theme}
              onChange={handleThemeChange}
              className="theme-select"
            >
              <optgroup label="Standard Themes">
                <option value="light">Default</option>
                <option value="dark">Dark</option>
                <option value="secondary">Secondary</option>
              </optgroup>
              <optgroup label="Seasonal Themes">
                <option value="winter">Winter</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="spring">Spring</option>
              </optgroup>
              <optgroup label="Accessibility Themes">
                <option value="deuteranopia">Deuteranopia-friendly</option>
                <option value="protanopia">Protanopia-friendly</option>
                <option value="tritanopia">Tritanopia-friendly</option>
                <option value="high-contrast">High Contrast</option>
                <option value="monochrome">Monochrome</option>
              </optgroup>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="rotate-toggle">Enable Rotation:</label>
            <input
              type="checkbox"
              id="rotate-toggle"
              onChange={handleCheckChange}
            />
            </div>
        </div>
      </Paper>
    </Container>
  );
};