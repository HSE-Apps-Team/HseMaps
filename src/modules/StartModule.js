import { DataModule } from './DataModule.js';
import { DOMCache } from './DOMCache.js';
import { Config } from '../config/config.js';

/**
 * Exposes the `fetchJSON` function from the DataModule globally.
 * This allows other parts of the application to call `fetchJSON` directly via `window.fetchJSON`.
 */
Object.assign(window, {
    fetchJSON: DataModule.fetchJSON
});

let emails = [];
fetchJSON('../src/elements/ValidEmails.json').then(data => {
    emails = data;
});

let passwords = [];
fetchJSON('../src/elements/ValidPasswords.json').then(data => {
  passwords = data;
});

let ip;
fetchJSON("https://api.ipify.org?format=json").then(data => {
    ip = data.ip;
});

/**
 * StartModule - Manages login validation and redirection based on user input.
 * 
 * This module handles the logic for validating user credentials, including checking the email, password,
 * and IP address before allowing access to the system.
 */
export const StartModule = {

    /**
     * Validates the login credentials and redirects to the homepage if the checks pass.
     * 
     * @method checkLogin
     * @returns {void}
     * @example
     * // Example of usage:
     * StartModule.checkLogin();
     * 
     * If the email, password, and IP address checks pass, the user is redirected to "index.html".
     */
    checkLogin() {
        if (checkEmail() && checkIP() && checkPassword()) {
            window.location.href = "index.html";
            console.log('redirected');
        };
    },

    /**
     * Validates the email input based on the domain.
     * 
     * The email must have a valid domain (e.g., @hse.ru) to be accepted as valid.
     * 
     * @method checkEmail
     * @returns {boolean} Returns `true` if the email domain is valid (matches an entry in `emails`), otherwise `false`.
     * @example
     * // Example of usage:
     * const isValid = StartModule.checkEmail();
     * 
     * Logs 'HSE email' if a valid email domain is found, otherwise logs 'Not HSE email'.
     */
    checkEmail() {
        var email = DOMCache[Config.LOG.SELECTORS.EMAIL].value;
        let source;
        let valid = false;

        // Loop through the email to extract domain after '@'
        for (let i = 0; i < email.length; i++) {
            if (email[i] === '@') {
                source = email.substring(i + 1);
                console.log(source);
                valid = true;
                break;
            }
        }

        // Convert domain to lowercase to standardize comparison
        source.toLowerCase();

        // Check if the email domain matches any in the preloaded list of valid domains
        for (let j = 0; j < emails.length; j++) {
            if (source === emails[j]) {
                console.log("HSE email");
                return true;
            }
        }
        console.log("Not HSE email");
        return false;
    },
    /**
     * Validates the password input by checking it against a list of valid passwords.
     * 
     * @method checkPassword
     * @returns {boolean} Returns `true` if the password matches any valid password, otherwise `false`.
     * @example
     * // Example of usage:
     * const isValidPassword = StartModule.checkPassword();
     * 
     * Checks the password input and logs the result accordingly.
     */
    checkPassword() {
        var password = DOMCache[Config.LOG.SELECTORS.PASSWORD].value;
        let valid = false;

        // Check if the entered password exists in the preloaded list of valid passwords
        for (let i = 0; i < passwords.length; i++) {
            if (password === passwords[i]) {
                valid = true;
                break;
            }
        }

        return valid;
    },

    /**
     * Validates the IP address by comparing it to a predefined valid IP.
     * 
     * The IP address must match a specific IP address (e.g., "209.160.198.202") to pass validation.
     * 
     * @method checkIP
     * @returns {boolean} Returns `true` if the IP matches the predefined valid IP, otherwise `false`.
     * @example
     * // Example of usage:
     * const isValidIP = StartModule.checkIP();
     * 
     * If the IP address matches "209.160.198.202", it returns true, otherwise false.
     */
    checkIP() {
        if (ip === "209.160.198.202") {
            return true;
        }
        return false;
    }
};