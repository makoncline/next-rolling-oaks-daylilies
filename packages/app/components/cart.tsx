import { useLocalStorage } from "@packages/design-system";
import React from "react";
import { siteConfig } from "../siteConfig";

export type Product = {
  id: number;
  name: string;
  price: number;
};
type CartItem = {
  productId: number;
  quantity: number;
};
type CartValue = {
  products: Record<number, Product>;
  cart: (Product & { quantity: number })[];
  addOrUpdateProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  changeQty: (productId: number, qty: number) => void;
  addOne: (productId: number) => void;
  removeOne: (productId: number) => void;
  clear: () => void;
  shipping: number;
  subTotal: number;
  total: number;
  numItems: number;
};
const Cart = React.createContext<CartValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useLocalStorage<Record<number, Product>>(
    "cartProducts",
    {}
  );
  const [cart, setCart] = useLocalStorage<Record<number, CartItem>>(
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
        [product.id]: {
          productId: product.id,
          quantity: 1,
        },
      }));
    }
  };

  const existsOrThrow = (productId: number) => {
    if (!products[productId]) {
      throw new Error(
        `Product with id ${productId} does not exist. use addOrUpdateProduct to add it.`
      );
    }
  };

  const removeProduct = (productId: number) => {
    if (products[productId]) {
      const newProducts = { ...products };
      delete newProducts[productId];
      setProducts(newProducts);
    }
    if (cart[productId]) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    }
  };

  const changeQty = (productId: number, qty: number) => {
    existsOrThrow(productId);
    if (qty < 1) {
      removeProduct(productId);
    } else {
      setCart((prevCart) => ({
        ...prevCart,
        [productId]: { ...prevCart[productId], quantity: qty },
      }));
    }
  };

  const existsInCartOrThrow = (productId: number) => {
    if (!cart[productId]) {
      throw new Error(
        `Product with id ${productId} does not exist in cart. use addOrUpdateProduct to add it.`
      );
    }
  };

  const addOne = (productId: number) => {
    existsInCartOrThrow(productId);
    changeQty(productId, cart[productId].quantity + 1);
  };

  const removeOne = (productId: number) => {
    existsInCartOrThrow(productId);
    changeQty(productId, cart[productId].quantity - 1);
  };

  const numItems = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const getShipping = () => {
    const {
      shipping: { baseItems, baseRate, ratePerAdd },
    } = siteConfig;
    if (numItems < 1) {
      return 0;
    }
    if (numItems < baseItems) {
      return baseRate;
    }
    return baseRate + (numItems - baseItems) * ratePerAdd;
  };
  const shipping = getShipping();
  const subTotal = Object.values(cart).reduce(
    (acc, item) => acc + item.quantity * products[item.productId].price,
    0
  );
  const total = subTotal + shipping;

  const displayCart = Object.values(cart).map((cartItem) => {
    const { productId, quantity } = cartItem;
    const product = products[productId];
    return {
      ...product,
      quantity,
    };
  });

  const clear = () => {
    setCart({});
    setProducts({});
  };
  const value = {
    products,
    cart: displayCart,
    addOrUpdateProduct,
    removeProduct,
    changeQty,
    addOne,
    removeOne,
    clear,
    // hack for nextjs hydration-error
    shipping: mounted ? shipping : 0,
    subTotal: mounted ? subTotal : 0,
    total: mounted ? total : 0,
    numItems: mounted ? numItems : 0,
  };
  return <Cart.Provider value={value}>{children}</Cart.Provider>;
};

export const useCart = () => {
  const context = React.useContext(Cart);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
