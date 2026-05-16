"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant: string;
}

export interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
  variant: string;
}

interface Notification {
  message: string;
  type: "success" | "info" | "error";
  id: number;
}

export interface User {
  email: string;
  name: string;
  isLoggedIn: boolean;
  id?: number;
}

interface ShopContextType {
  cart: CartItem[];
  favorites: FavoriteItem[];
  compare: any[];
  user: User | null;
  notification: Notification | null;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: number) => void;
  isInFavorites: (id: number) => boolean;
  addToCompare: (product: any) => void;
  removeFromCompare: (id: number) => void;
  isInCompare: (id: number) => boolean;
   login: (email: string, password?: string) => Promise<boolean>;
   register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  notify: (message: string, type?: "success" | "info" | "error") => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [compare, setCompare] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("maff_cart");
    const savedFavorites = localStorage.getItem("maff_favorites");
    const savedCompare = localStorage.getItem("maff_compare");
    const savedUser = localStorage.getItem("maff_user");
    const token = localStorage.getItem("maff_token");
    
    try {
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed.filter(item => item !== null && typeof item === 'object').map((item: any) => ({
            ...item,
            price: Number(String(item.price || 0).replace(/\s/g, "")) || 0
          })));
        }
      }
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter(item => item !== null && typeof item === 'object').map((item: any) => ({
            ...item,
            price: Number(String(item.price || 0).replace(/\s/g, "")) || 0
          })));
        }
      }
      if (savedCompare) {
        const parsed = JSON.parse(savedCompare);
        if (Array.isArray(parsed)) {
          setCompare(parsed.filter(item => item !== null && typeof item === 'object').map((item: any) => ({
            ...item,
            price: Number(String(item.price || 0).replace(/\s/g, "")) || 0
          })));
        }
      }
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch(e) {}
      }
    } catch (e) {
      console.error("Failed to parse saved shop data", e);
    }
    
    if (token) {
      fetchProfile(token);
    }
    setIsMounted(true);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("/api/v1/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          email: data.email,
          name: data.full_name || data.email.split('@')[0],
          isLoggedIn: true,
          id: data.id
        });
      } else if (response.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("maff_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("maff_favorites", JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("maff_compare", JSON.stringify(compare));
    }
  }, [compare, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (user) {
        localStorage.setItem("maff_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("maff_user");
      }
    }
  }, [user, isMounted]);

  const login = async (email: string, password?: string) => {
    if (password) {
      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);
        
        const response = await fetch("/api/v1/login/access-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("maff_token", data.access_token);
          await fetchProfile(data.access_token);
          notify("Вы успешно авторизовались", "success");
          return true;
        } else {
          notify("Неверный логин или пароль", "error");
          return false;
        }
      } catch (err) {
        notify("Ошибка подключения к серверу", "error");
        return false;
      }
    }
    // Fallback for simple email login (mock)
    const newUser = { email, name: email.split('@')[0], isLoggedIn: true };
    setUser(newUser);
    notify("Вы успешно авторизовались", "success");
    return true;
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: name
        }),
      });
      
      if (response.ok) {
        notify("Регистрация успешна! Теперь вы можете войти", "success");
        return true;
      } else {
        const data = await response.json();
        notify(data.detail || "Ошибка при регистрации", "error");
        return false;
      }
    } catch (err) {
      notify("Ошибка подключения к серверу", "error");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("maff_token");
    setUser(null);
    notify("Вы вышли из системы", "info");
  };

  const notify = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now();
    setNotification({ message, type, id });
    setTimeout(() => {
      setNotification(prev => prev?.id === id ? null : prev);
    }, 3000);
  };

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    notify(`Добавлено в корзину: ${product.name || "Товар"}`);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const addToFavorites = (product: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      notify(`Добавлено в избранное: ${product.name || "Товар"}`);
      return [...prev, product];
    });
  };

  const removeFromFavorites = (id: number) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
    notify("Удалено из избранного");
  };

  const isInFavorites = (id: number) => favorites.some(item => item.id === id);

  const addToCompare = (product: any) => {
    setCompare(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      if (prev.length >= 4) {
        notify("Можно сравнивать не более 4 товаров", "error");
        return prev;
      }
      notify(`Добавлено к сравнению: ${product.name || product.title || "Товар"}`);
      return [...prev, product];
    });
  };

  const removeFromCompare = (id: number) => {
    setCompare(prev => prev.filter(item => item.id !== id));
    notify("Удалено из сравнения");
  };

  const isInCompare = (id: number) => compare.some(item => item.id === id);

  return (
    <ShopContext.Provider value={{ 
      cart, 
      favorites, 
      compare,
      user,
      notification,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      addToFavorites, 
      removeFromFavorites,
      isInFavorites,
      addToCompare,
      removeFromCompare,
      isInCompare,
      login,
      register,
      logout,
      notify
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
