import { RoleManager } from './roleManager';
import { SkillManager } from './skillManager';

export class AnemoneSDK {
    public readonly roleManager: RoleManager;
    public readonly skillManager: SkillManager;
    
    constructor(
    ) {
        this.roleManager = new RoleManager();
        this.skillManager = new SkillManager();
    }
} 