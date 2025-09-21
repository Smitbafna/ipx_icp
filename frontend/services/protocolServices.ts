// services/vaultService.ts
import { Principal } from '@dfinity/principal';
import { VaultCanister } from '../types/canisters';

export class VaultService {
  constructor(private actor: VaultCanister) {}

  async deposit(amount: number): Promise<string> {
    try {
      const result = await this.actor.deposit(BigInt(amount));
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(`Deposit failed: ${error}`);
    }
  }

  async withdraw(amount: number): Promise<string> {
    try {
      const result = await this.actor.withdraw(BigInt(amount));
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(`Withdrawal failed: ${error}`);
    }
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.actor.get_balance();
      return Number(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  async getVaultData() {
    try {
      return await this.actor.get_vault_data();
    } catch (error) {
      throw new Error(`Failed to get vault data: ${error}`);
    }
  }
}

// services/campaignService.ts
import { CampaignFactoryCanister, CampaignMetadata } from '../types/canisters';

export class CampaignService {
  constructor(private actor: CampaignFactoryCanister) {}

  async createCampaign(metadata: Omit<CampaignMetadata, 'target_amount' | 'end_date'> & {
    target_amount: number;
    end_date: number;
  }): Promise<number> {
    try {
      const campaignMetadata: CampaignMetadata = {
        ...metadata,
        target_amount: BigInt(metadata.target_amount),
        end_date: BigInt(metadata.end_date),
      };

      const result = await this.actor.create_campaign(campaignMetadata);
      if ('Ok' in result) {
        return Number(result.Ok);
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(`Campaign creation failed: ${error}`);
    }
  }

  async fundCampaign(campaignId: number, amount: number): Promise<string> {
    try {
      const result = await this.actor.fund_campaign(BigInt(campaignId), BigInt(amount));
      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      throw new Error(`Campaign funding failed: ${error}`);
    }
  }

  async getCampaign(campaignId: number) {
    try {
      const campaign = await this.actor.get_campaign(BigInt(campaignId));
      if (campaign) {
        return {
          ...campaign,
          id: Number(campaign.id),
          current_amount: Number(campaign.current_amount),
          backers_count: Number(campaign.backers_count),
          created_at: Number(campaign.created_at),
          metadata: {
            ...campaign.metadata,
            target_amount: Number(campaign.metadata.target_amount),
            end_date: Number(campaign.metadata.end_date),
          },
        };
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get campaign: ${error}`);
    }
  }

  async getAllCampaigns() {
    try {
      const campaigns = await this.actor.get_all_campaigns();
      return campaigns.map(campaign => ({
        ...campaign,
        id: Number(campaign.id),
        current_amount: Number(campaign.current_amount),
        backers_count: Number(campaign.backers_count),
        created_at: Number(campaign.created_at),
        metadata: {
          ...campaign.metadata,
          target_amount: Number(campaign.metadata.target_amount),
          end_date: Number(campaign.metadata.end_date),
        },
      }));
    } catch (error) {
      throw new Error(`Failed to get campaigns: ${error}`);
    }
  }

  async getUserCampaigns(userPrincipal: string) {
    try {
      const principal = Principal.fromText(userPrincipal);
      const campaigns = await this.actor.get_user_campaigns(principal);
      return campaigns.map(campaign => ({
        ...campaign,
        id: Number(campaign.id),
        current_amount: Number(campaign.current_amount),
        backers_count: Number(campaign.backers_count),
        created_at: Number(campaign.created_at),
        metadata: {
          ...campaign.metadata,
          target_amount: Number(campaign.metadata.target_amount),
          end_date: Number(campaign.metadata.end_date),
        },
      }));
    } catch (error) {
      throw new Error(`Failed to get user campaigns: ${error}`);
    }
  }
}
