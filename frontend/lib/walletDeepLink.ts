/**
 * Utility functions for opening mobile wallet apps via deep links
 */

export interface WalletDeepLinkOptions {
  returnUrl?: string;
  action?: 'connect' | 'sign' | 'pay';
}

/**
 * Check if user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Check if user is on iOS
 */
export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * Check if user is on Android
 */
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Open ArgentX mobile wallet
 */
export const openArgentX = (options?: WalletDeepLinkOptions): void => {
  const returnUrl = options?.returnUrl || window.location.href;

  // ArgentX deep link format
  const deepLink = `argentx://app?url=${encodeURIComponent(returnUrl)}`;

  // Try deep link first
  window.location.href = deepLink;

  // Fallback to app store if deep link doesn't work (after 2 seconds)
  setTimeout(() => {
    const storeUrl = isIOS()
      ? 'https://apps.apple.com/app/argent-x/id6446690030'
      : 'https://play.google.com/store/apps/details?id=im.argent.contractwalletclient';

    if (confirm('ArgentX wallet not installed. Would you like to download it?')) {
      window.open(storeUrl, '_blank');
    }
  }, 2000);
};

/**
 * Open Braavos mobile wallet
 */
export const openBraavos = (options?: WalletDeepLinkOptions): void => {
  const returnUrl = options?.returnUrl || window.location.href;

  // Braavos deep link format
  const deepLink = `braavos://app?url=${encodeURIComponent(returnUrl)}`;

  // Try deep link
  window.location.href = deepLink;

  // Fallback to app store
  setTimeout(() => {
    const storeUrl = isIOS()
      ? 'https://apps.apple.com/app/braavos-wallet/id1641643345'
      : 'https://play.google.com/store/apps/details?id=com.braavos.wallet';

    if (confirm('Braavos wallet not installed. Would you like to download it?')) {
      window.open(storeUrl, '_blank');
    }
  }, 2000);
};

/**
 * Try to open any available wallet app
 * Tries ArgentX first, then Braavos
 */
export const openAnyWallet = (options?: WalletDeepLinkOptions): void => {
  if (!isMobileDevice()) {
    alert('This feature is for mobile devices. Please use the wallet browser extension on desktop.');
    return;
  }

  const returnUrl = options?.returnUrl || window.location.href;

  // Try ArgentX
  openArgentX({ returnUrl });

  // Try Braavos as backup after a short delay
  setTimeout(() => {
    openBraavos({ returnUrl });
  }, 500);
};

/**
 * Get wallet download links
 */
export const getWalletDownloadLinks = () => {
  return {
    argentX: {
      ios: 'https://apps.apple.com/app/argent-x/id6446690030',
      android: 'https://play.google.com/store/apps/details?id=im.argent.contractwalletclient',
      chrome: 'https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb',
    },
    braavos: {
      ios: 'https://apps.apple.com/app/braavos-wallet/id1641643345',
      android: 'https://play.google.com/store/apps/details?id=com.braavos.wallet',
      chrome: 'https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma',
    },
  };
};
