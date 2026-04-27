const sleep = (duration = 140) => new Promise((resolve) => setTimeout(resolve, duration));

export const inventorySyncService = {
  async syncAddonUsage(payload) {
    await sleep();
    console.log('Syncing Add-on usage with Inventory:', payload);
    // In a real app, this would call inventory API to reduce stock
    return { success: true, message: 'Inventory synced successfully.' };
  },
  
  async syncPartReplacement(payload) {
    await sleep();
    console.log('Syncing Part replacement with Inventory:', payload);
    return { success: true, message: 'Inventory synced successfully.' };
  }
};
