import { useLocalStorage } from "components/ui";
import React from "react";
import { siteConfig } from "../siteConfig";

export type Product = {
  id: string;
  name: string;
  price: number;
};
type CartItem = {
  productId: string;
  quantity: number;
};
type CartValue = {
  products: Record<string, Product>;
  cart: (Product & { quantity: number })[];
  addOrUpdateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  changeQty: (productId: string, qty: number) => void;
  addOne: (productId: string) => void;
  removeOne: (productId: string) => void;
  clear: () => void;
  shipping: number;
  subTotal: number;
  total: number;
  numItems: number;
};
const Cart = React.createContext<CartValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useLocalStorage<Record<string, Product>>(
    "cartProducts",
    {}
  );
  const [cart, setCart] = useLocalStorage<Record<string, CartItem>>(
    "cartItems",
    {}
  );
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const addOrUpdateProduct = (product: Product) => {
    setProducts((prevProducts) => ({
      ...prevProducts,
      [product.id]: product,
    }));
    if (cart[product.id]) {
      addOne(product.id);
    } else {
      setCart((prevCart) => ({
        ...prevCart,
        [product.id]: { productId: product.id, quantity: 1 },
      }));
    }
  };

  const existsOrThrow = (productId: string) => {
    if (!products[productId]) {
      throw new Error(`Product with id ${productId} does not exist`);
    }
  };

  const removeProduct = (productId: string) => {
    existsOrThrow(productId);
    setProducts((prevProducts) => {
      const newProducts = { ...prevProducts };
      // Remove the product with the specified ID
      delete newProducts[productId];
      return newProducts;
    });
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      // Remove the cart item with the specified productId
      delete newCart[productId];
      return newCart;
    });
  };

  const changeQty = (productId: string, qty: number) => {
    existsInCartOrThrow(productId);
    if (qty <= 0) {
      removeProduct(productId);
      return;
    }
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: { ...prevCart[productId], quantity: qty },
    }));
  };

  const existsInCartOrThrow = (productId: string) => {
    existsOrThrow(productId);
    if (!cart[productId]) {
      throw new Error(`Product with id ${productId} does not exist in cart`);
    }
  };

  const addOne = (productId: string) => {
    existsInCartOrThrow(productId);
    changeQty(productId, cart[productId].quantity + 1);
  };

  const removeOne = (productId: string) => {
    existsInCartOrThrow(productId);
    const newQty = cart[productId].quantity - 1;
    if (newQty <= 0) {
      removeProduct(productId);
      return;
    }
    changeQty(productId, newQty);
  };

  const getShipping = () => {
    if (!mounted) return 0;
    const baseRate = siteConfig.shipping.baseRate;
    const baseItems = siteConfig.shipping.baseItems;
    const ratePerAdd = siteConfig.shipping.ratePerAdd;
    const numItems = Object.values(cart).reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    if (numItems === 0) return 0;
    if (numItems <= baseItems) return baseRate;
    // Add extraItems * ratePerAdd
    const extraItems = numItems - baseItems;
    return baseRate + extraItems * ratePerAdd;
  };

  const getSubTotal = () => {
    if (!mounted) return 0;
    return Object.values(cart).reduce((acc, item) => {
      const product = products[item.productId];
      if (!product) return acc;
      return acc + product.price * item.quantity;
    }, 0);
  };

  const shipping = getShipping();
  const subTotal = getSubTotal();
  const total = subTotal + shipping;
  const numItems = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const clear = React.useCallback(() => {
    setProducts({});
    setCart({});
  }, [setCart, setProducts]);

  const cartList = Object.values(cart).map((item) => {
    const product = products[item.productId];
    return {
      ...product,
      quantity: item.quantity,
    };
  });

  const value = {
    products,
    cart: cartList,
    addOrUpdateProduct,
    removeProduct,
    changeQty,
    addOne,
    removeOne,
    clear,
    shipping,
    subTotal,
    total,
    numItems,
  };
  return <Cart.Provider value={value}>{children}</Cart.Provider>;
};

export const useCart = () => {
  const context = React.useContext(Cart);
  if (context === undefined) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return context;
};
