
import { StartModule } from '../src/modules/StartModule.js';



(async () => {
        Object.assign(window, {
            checkIP: StartModule.checkIP,
            checkEmail: StartModule.checkEmail,
            checkPassword: StartModule.checkPassword,
            checkLogin: StartModule.checkLogin
        });
})();
