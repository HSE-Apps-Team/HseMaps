import { DataModule } from "./DataModule.js";
import { StateManager } from './StateManager.js';

export const StreetViewModule = {
getImg(){
    const mat = DataModule.get().imgs;
    const currentPath = [StateManager.get().path[StateManager.get().currentPathSegment],StateManager.get().path[StateManager.get().currentPathSegment+1]];
    const from = currentPath[0];
    const to = currentPath[1];
    return mat[from][to];
}
};