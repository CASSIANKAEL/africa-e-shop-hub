import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppLanguage = "fr" | "en" | "es";

const languageNames: Record<AppLanguage, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
};

const messages = {
  fr: {
    search: "Rechercher une commande, un client…",
    notifications: "Notifications",
    language: "Langue",
    dashboard: "Tableau de bord",
    overview: "Vue d'ensemble",
    stores: "Boutiques",
    products: "Produits",
    orders: "Commandes",
    customers: "Clients",
    forms: "Formulaires & intégrations",
    orderForm: "Formulaire de commande",
    offers: "Offres de quantité",
    pixels: "Pixels publicitaires",
    integrations: "Intégrations",
    subscription: "Abonnement",
    settings: "Paramètres",
    control: "Pilotage",
    account: "Compte",
    newStore: "Nouvelle boutique",
    dragHint: "Maintenez la poignée puis glissez ce champ vers le haut ou le bas.",
    animation: "Animation du bouton",
    none: "Aucune",
    pulse: "Pulsation",
    bounce: "Rebond doux",
    shake: "Secousse",
    float: "Flottement",
    shine: "Brillance",
  },
  en: {
    search: "Search orders, customers…",
    notifications: "Notifications",
    language: "Language",
    dashboard: "Dashboard",
    overview: "Overview",
    stores: "Stores",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    forms: "Forms & integrations",
    orderForm: "Order form",
    offers: "Quantity offers",
    pixels: "Advertising pixels",
    integrations: "Integrations",
    subscription: "Subscription",
    settings: "Settings",
    control: "Management",
    account: "Account",
    newStore: "New store",
    dragHint: "Hold the handle and drag this field up or down.",
    animation: "Button animation",
    none: "None",
    pulse: "Pulse",
    bounce: "Soft bounce",
    shake: "Shake",
    float: "Float",
    shine: "Shine",
  },
  es: {
    search: "Buscar pedidos, clientes…",
    notifications: "Notificaciones",
    language: "Idioma",
    dashboard: "Panel",
    overview: "Vista general",
    stores: "Tiendas",
    products: "Productos",
    orders: "Pedidos",
    customers: "Clientes",
    forms: "Formularios e integraciones",
    orderForm: "Formulario de pedido",
    offers: "Ofertas por cantidad",
    pixels: "Píxeles publicitarios",
    integrations: "Integraciones",
    subscription: "Suscripción",
    settings: "Configuración",
    control: "Gestión",
    account: "Cuenta",
    newStore: "Nueva tienda",
    dragHint: "Mantén el asa y arrastra este campo hacia arriba o abajo.",
    animation: "Animación del botón",
    none: "Ninguna",
    pulse: "Pulso",
    bounce: "Rebote suave",
    shake: "Sacudida",
    float: "Flotación",
    shine: "Brillo",
  },
} as const;

type MessageKey = keyof (typeof messages)["fr"];

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("sooko-language");
    if (saved === "fr" || saved === "en" || saved === "es") setLanguageState(saved);
  }, []);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem("sooko-language", next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (key) => messages[language][key] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export { languageNames };