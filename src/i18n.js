import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // English translations
          createAccount: 'Create Account',
          login: 'Login',
          email: 'Email',
          password: 'Password',
          signUp: 'Sign Up',
          alreadyHaveAccount: 'Already have an account? Login',
          newUser: 'New user? Create account',
          map: 'Map',
          searchLocations: 'Search locations...',
          focusOnCurrentLocation: 'Focus on current location',
          readMore: 'Read more',
          english: 'English',
          german: 'German',
          french: 'French',
          settings: 'Settings',
          userProfile: 'User Profile',
          enableNotifications: 'Enable notifications',
          darkMode: 'Dark mode',
          language: 'Language',
        }
      },
      de: {
        translation: {
          // German translations
          createAccount: 'Konto erstellen',
          login: 'Anmelden',
          email: 'E-Mail',
          password: 'Passwort',
          signUp: 'Registrieren',
          alreadyHaveAccount: 'Bereits ein Konto? Anmelden',
          newUser: 'Neuer Benutzer? Konto erstellen',
          map: 'Karte',
          searchLocations: 'Standorte suchen...',
          focusOnCurrentLocation: 'Auf aktuellen Standort fokussieren',
          readMore: 'Mehr lesen',
          english: 'Englisch',
          german: 'Deutsch',
          french: 'Französisch',
          settings: 'Einstellungen',
          userProfile: 'Benutzerprofil',
          enableNotifications: 'Benachrichtigungen aktivieren',
          darkMode: 'Dunkelmodus',
          language: 'Sprache',
        }
      },
      fr: {
        translation: {
            //french translations
            createAccount: 'Créer un compte',
            login: 'Se connecter',
            email: 'Email',
            password: 'Mot de passe',
            signUp: 'S\'inscrire',
            alreadyHaveAccount: 'Déjà un compte ? Se connecter',
            newUser: 'Nouveau utilisateur ? Créer un compte',
            map: 'Carte',
            searchLocations: 'Rechercher des lieux...',
            focusOnCurrentLocation: 'Focaliser sur la localisation actuelle',
            readMore: 'Lire la suite',
            english: 'Anglais',
            german: 'Allemand',
            french: 'Français',
            settings: 'Paramètres',
            userProfile: 'Profil de l\'utilisateur',
            enableNotifications: 'Activer les notifications',
            darkMode: 'Mode sombre',
            language: 'Langue',
        }
      }
      // Add more languages as needed
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;