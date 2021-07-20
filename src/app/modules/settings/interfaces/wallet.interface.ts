import { WalletType } from "../enums/wallet.enum";

export interface IWalletBalance {
  wallet_type: WalletType,
  wallet_balance: number
}