import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Language resources
const resources = {
  en: {
    translation: {
      // Menu Page
      "restaurant_menu": "Restaurant Menu",
      "discover_selection": "Discover our selection of drinks and food",
      "special_offers": "Special Offers",
      "limited_time_offer": "Limited Time Offer",
      "drinks_beverages": "Drinks & Beverages",
      "food_menu": "Food Menu",
      "all_drinks": "All Drinks",
      "all_food": "All Food",
      "other_items": "Other Items",
      "no_items_available": "No menu items available at the moment.",
      "search_menu_items": "Search menu items...",
      "items_found_for": "items found for",
      "search_results": "Search Results",
      "no_search_results": "No items match your search. Try different keywords.",
      
      // Admin Dashboard
      "admin_dashboard": "Admin Dashboard",
      "manage_menu": "Manage your bar menu",
      "logout": "Logout",
      "restaurant_settings": "Restaurant Settings",
      "manage_restaurant": "Manage your restaurant name and logo",
      "edit_settings": "Edit Settings",
      "restaurant_name": "Restaurant Name",
      "no_logo_uploaded": "No logo uploaded",
      "menu_items": "Menu Items",
      "add_edit_remove": "Add, edit, or remove items from your menu",
      "add_item": "Add Item",
      "name": "Name",
      "price": "Price",
      "description": "Description",
      "category": "Category",
      "available": "Available",
      "actions": "Actions",
      "edit": "Edit",
      "delete": "Delete",
      "offers_promotions": "Offers & Promotions",
      "manage_offers": "Manage special offers and promotions",
      "offer_title": "Offer Title",
      "active": "Active",
      "activate": "Activate",
      "deactivate": "Deactivate",
      "qr_generator": "QR Code Generator",
      "generate_qr": "Generate QR codes for tables to access the menu",
      "table_number": "Table Number or Name",
      "bulk_qr": "Bulk QR Code Generator",
      "generate_print": "Generate and print multiple QR codes at once",
      
      // Common
      "save": "Save",
      "cancel": "Cancel",
      "add": "Add",
      "update": "Update",
      "required": "Required"
    }
  },
  es: {
    translation: {
      // Menu Page
      "restaurant_menu": "Menú del Restaurante",
      "discover_selection": "Descubre nuestra selección de bebidas y comida",
      "special_offers": "Ofertas Especiales",
      "limited_time_offer": "Oferta por tiempo limitado",
      "drinks_beverages": "Bebidas y Refrescos",
      "food_menu": "Menú de Comida",
      "all_drinks": "Todas las Bebidas",
      "all_food": "Toda la Comida",
      "other_items": "Otros Artículos",
      "no_items_available": "No hay artículos de menú disponibles en este momento.",
      "search_menu_items": "Buscar artículos del menú...",
      "items_found_for": "artículos encontrados para",
      "search_results": "Resultados de Búsqueda",
      "no_search_results": "Ningún artículo coincide con tu búsqueda. Prueba con palabras clave diferentes.",
      
      // Admin Dashboard
      "admin_dashboard": "Panel de Administración",
      "manage_menu": "Gestiona el menú de tu bar",
      "logout": "Cerrar Sesión",
      "restaurant_settings": "Configuración del Restaurante",
      "manage_restaurant": "Gestiona el nombre y logo de tu restaurante",
      "edit_settings": "Editar Configuración",
      "restaurant_name": "Nombre del Restaurante",
      "no_logo_uploaded": "No se ha subido ningún logo",
      "menu_items": "Artículos del Menú",
      "add_edit_remove": "Añade, edita o elimina artículos del menú",
      "add_item": "Añadir Artículo",
      "name": "Nombre",
      "price": "Precio",
      "description": "Descripción",
      "category": "Categoría",
      "available": "Disponible",
      "actions": "Acciones",
      "edit": "Editar",
      "delete": "Eliminar",
      "offers_promotions": "Ofertas y Promociones",
      "manage_offers": "Gestiona ofertas especiales y promociones",
      "offer_title": "Título de la Oferta",
      "active": "Activo",
      "activate": "Activar",
      "deactivate": "Desactivar",
      "qr_generator": "Generador de Códigos QR",
      "generate_qr": "Genera códigos QR para mesas para acceder al menú",
      "table_number": "Número o Nombre de Mesa",
      "bulk_qr": "Generador de Códigos QR en Bloque",
      "generate_print": "Genera e imprime múltiples códigos QR a la vez",
      
      // Common
      "save": "Guardar",
      "cancel": "Cancelar",
      "add": "Añadir",
      "update": "Actualizar",
      "required": "Requerido"
    }
  },
  fr: {
    translation: {
      // Menu Page
      "restaurant_menu": "Menu du Restaurant",
      "discover_selection": "Découvrez notre sélection de boissons et de plats",
      "special_offers": "Offres Spéciales",
      "limited_time_offer": "Offre pour une durée limitée",
      "drinks_beverages": "Boissons et Raffraîchissements",
      "food_menu": "Menu de Nourriture",
      "all_drinks": "Toutes les Boissons",
      "all_food": "Toute la Nourriture",
      "other_items": "Autres Articles",
      "no_items_available": "Aucun article de menu disponible pour le moment.",
      "search_menu_items": "Rechercher des articles de menu...",
      "items_found_for": "articles trouvés pour",
      "search_results": "Résultats de Recherche",
      "no_search_results": "Aucun article ne correspond à votre recherche. Essayez différents mots-clés.",
      
      // Admin Dashboard
      "admin_dashboard": "Tableau de Bord Admin",
      "manage_menu": "Gérez le menu de votre bar",
      "logout": "Se Déconnecter",
      "restaurant_settings": "Paramètres du Restaurant",
      "manage_restaurant": "Gérez le nom et le logo de votre restaurant",
      "edit_settings": "Modifier les Paramètres",
      "restaurant_name": "Nom du Restaurant",
      "no_logo_uploaded": "Aucun logo téléchargé",
      "menu_items": "Articles du Menu",
      "add_edit_remove": "Ajoutez, modifiez ou supprimez des articles du menu",
      "add_item": "Ajouter un Article",
      "name": "Nom",
      "price": "Prix",
      "description": "Description",
      "category": "Catégorie",
      "available": "Disponible",
      "actions": "Actions",
      "edit": "Modifier",
      "delete": "Supprimer",
      "offers_promotions": "Offres et Promotions",
      "manage_offers": "Gérez les offres spéciales et les promotions",
      "offer_title": "Titre de l'Offre",
      "active": "Actif",
      "activate": "Activer",
      "deactivate": "Désactiver",
      "qr_generator": "Générateur de Codes QR",
      "generate_qr": "Générez des codes QR pour les tables pour accéder au menu",
      "table_number": "Numéro ou Nom de Table",
      "bulk_qr": "Générateur de Codes QR en Bloc",
      "generate_print": "Générez et imprimez plusieurs codes QR à la fois",
      
      // Common
      "save": "Sauvegarder",
      "cancel": "Annuler",
      "add": "Ajouter",
      "update": "Mettre à jour",
      "required": "Requis"
    }
  },
  hi: {
    translation: {
      // Menu Page
      "restaurant_menu": "रेस्तरां मेनू",
      "discover_selection": "हमारे पेय और भोजन का चयन खोजें",
      "special_offers": "विशेष प्रस्ताव",
      "limited_time_offer": "सीमित समय का प्रस्ताव",
      "drinks_beverages": "पेय और पेय पदार्थ",
      "food_menu": "भोजन मेनू",
      "all_drinks": "सभी पेय",
      "all_food": "सभी भोजन",
      "other_items": "अन्य वस्तुएं",
      "no_items_available": "इस समय कोई मेनू वस्तुएं उपलब्ध नहीं हैं।",
      "search_menu_items": "मेनू वस्तुएं खोजें...",
      "items_found_for": "वस्तुएं मिलीं",
      "search_results": "खोज परिणाम",
      "no_search_results": "आपकी खोज से मेल खाने वाली कोई वस्तु नहीं मिली। अलग-अलग कीवर्ड आज़माएं।",
      
      // Admin Dashboard
      "admin_dashboard": "व्यवस्थापक डैशबोर्ड",
      "manage_menu": "अपने बार मेनू का प्रबंधन करें",
      "logout": "लॉग आउट",
      "restaurant_settings": "रेस्तरां सेटिंग्स",
      "manage_restaurant": "अपने रेस्तरां के नाम और लोगो का प्रबंधन करें",
      "edit_settings": "सेटिंग्स संपादित करें",
      "restaurant_name": "रेस्तरां का नाम",
      "no_logo_uploaded": "कोई लोगो अपलोड नहीं किया गया",
      "menu_items": "मेनू वस्तुएं",
      "add_edit_remove": "अपने मेनू में वस्तुएं जोड़ें, संपादित करें या हटाएं",
      "add_item": "वस्तु जोड़ें",
      "name": "नाम",
      "price": "मूल्य",
      "description": "विवरण",
      "category": "श्रेणी",
      "available": "उपलब्ध",
      "actions": "कार्य",
      "edit": "संपादित करें",
      "delete": "हटाएं",
      "offers_promotions": "प्रस्ताव और प्रचार",
      "manage_offers": "विशेष प्रस्ताव और प्रचार का प्रबंधन करें",
      "offer_title": "प्रस्ताव शीर्षक",
      "active": "सक्रिय",
      "activate": "सक्रिय करें",
      "deactivate": "निष्क्रिय करें",
      "qr_generator": "QR कोड जेनरेटर",
      "generate_qr": "मेनू तक पहुंच के लिए मेजों के लिए QR कोड उत्पन्न करें",
      "table_number": "मेज संख्या या नाम",
      "bulk_qr": "थोक QR कोड जेनरेटर",
      "generate_print": "एक साथ कई QR कोड उत्पन्न और मुद्रित करें",
      
      // Common
      "save": "सहेजें",
      "cancel": "रद्द करें",
      "add": "जोड़ें",
      "update": "अपडेट करें",
      "required": "आवश्यक"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;