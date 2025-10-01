import { AccountInterface } from "starknet";

declare global {
  interface Window {
    starknet?: any;
    
    starknet_braavos?: any;
    starknet_argentX?: any;
  }
}

export const connectWallet = async (): Promise<{ address: string; chainId: string; account: AccountInterface } | null> => {
  try {
    // Check if wallet extension is available
    if (!window.starknet) {
      // On mobile, provide helpful message with wallet links
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const installArgentX = confirm(
          "Starknet wallet not detected.\n\nWould you like to install ArgentX wallet?\n\n(Tap OK to open App Store/Play Store)"
        );

        if (installArgentX) {
          // Open wallet download page
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
          const walletUrl = isIOS
            ? "https://apps.apple.com/app/argent-x/id6446690030"
            : "https://play.google.com/store/apps/details?id=im.argent.contractwalletclient";
          window.open(walletUrl, "_blank");
        }
      } else {
        alert("Please install ArgentX or Braavos wallet extension for desktop browsers");
      }
      return null;
    }

    // Enable the wallet
    await window.starknet.enable({ starknetVersion: "v5" });

    if (!window.starknet.isConnected) {
      throw new Error("Wallet not connected");
    }

    const account = window.starknet.account;
    if (!account) {
      throw new Error("No account found");
    }

    return {
      address: account.address,
      chainId: window.starknet.chainId || "SN_SEPOLIA",
      account: account,
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    return null;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    if (window.starknet) {
      // Most wallets don't have a disconnect method, just clear local state
      window.starknet.isConnected = false;
    }
  } catch (error) {
    console.error("Wallet disconnection error:", error);
  }
};

export const getConnectedWallet = async (): Promise<{ address: string; chainId: string; account: AccountInterface } | null> => {
  try {
    if (!window.starknet || !window.starknet.isConnected) {
      return null;
    }

    const account = window.starknet.account;
    if (!account) {
      return null;
    }

    return {
      address: account.address,
      chainId: window.starknet.chainId || "SN_SEPOLIA",
      account: account,
    };
  } catch (error) {
    return null;
  }
};