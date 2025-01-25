import { SuiClient } from '@mysten/sui/client';
import { RoleManager } from './roleManager';
import { SkillManager } from './skillManager';

export class AnemoneSDK {
    public readonly roleManager: RoleManager;
    public readonly skillManager: SkillManager;
    
    constructor(
        client: SuiClient,
        signer: Parameters<SuiClient['signAndExecuteTransaction']>[0]['signer']
    ) {
        this.roleManager = new RoleManager(client, signer);
        this.skillManager = new SkillManager(client, signer);
    }
} 