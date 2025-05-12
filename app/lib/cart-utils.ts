/**
 * Cart utility functions for handling cart operations
 */

/**
 * Format cart items from localStorage to API format
 * @param cartItems - Array of cart items from localStorage
 * @returns Formatted cart items for API
 */
export function formatCartItemsForAPI(cartItems: any[]): any[] {
  return cartItems.map(item => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
}

/**
 * Format cart items from API to client format
 * @param apiItems - Array of cart items from API
 * @returns Formatted cart items for client
 */
export function formatCartItemsForClient(apiItems: any[]): any[] {
  return apiItems.map(item => ({
    id: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.quantity
  }));
}

/**
 * Merge guest cart with user cart
 * This is used when a user logs in with items in their guest cart
 * @param guestCart - Array of cart items from localStorage
 * @param userCart - Array of cart items from API
 * @returns Merged cart items
 */
export function mergeGuestCartWithUserCart(guestCart: any[], userCart: any[]): any[] {
  // If either cart is empty, return the other
  if (!guestCart.length) return userCart;
  if (!userCart.length) return guestCart;
  
  // Create a map of user cart items by productId
  const userCartMap = new Map();
  
  userCart.forEach(item => {
    userCartMap.set(item.productId, item);
  });
  
  // Merge guest cart items, updating quantities for items that exist in both carts
  const mergedItems = [...userCart];
  
  guestCart.forEach(guestItem => {
    const userItem = userCartMap.get(guestItem.id);
    
    if (userItem) {
      // Update quantity if item exists in both carts
      userItem.quantity = Math.max(userItem.quantity, guestItem.quantity);
    } else {
      // Add new item from guest cart
      mergedItems.push({
        productId: guestItem.id,
        name: guestItem.name,
        price: guestItem.price,
        image: guestItem.image,
        quantity: guestItem.quantity
      });
    }
  });
  
  return mergedItems;
} 