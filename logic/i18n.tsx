import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NativeModules, Platform } from 'react-native';

export type AppLanguage = 'en' | 'lt';

export const appLanguageStorageKey = 'appLanguage';

type TranslationKey = keyof typeof translations.en;

type I18nContextValue = {
  hasLoadedLanguage: boolean;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const translations = {
  en: {
    'app.name': 'Drink Water',
    'nav.home': 'Home',
    'nav.statistics': 'Statistics',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.terms': 'Terms',
    'nav.support': 'Support',
    'nav.disclaimer': 'Disclaimer',
    'nav.howToUse': 'How to use',
    'nav.privacyPolicy': 'Privacy Policy',
    back: 'Back',
    save: 'Save',
    update: 'Update',
    saved: '✓ Saved',
    updated: '✓ Updated',
    on: 'ON',
    off: 'OFF',
    'home.waterReminder': 'Water\nReminder',
    'home.today': 'Today',
    'home.dailyGoal': 'Daily goal',
    'home.selectedAmount': 'Selected amount',
    'home.addWater': 'Add water',
    'notification.title': 'Drink Water',
    'notification.body': 'Time to drink some water.',
    'status.low': 'low',
    'status.medium': 'medium',
    'status.good': 'good',
    'status.perfect': 'perfect',
    'profile.title': 'Profile',
    'profile.weight': 'Weight',
    'profile.enterWeight': 'Enter weight',
    'profile.age': 'Age',
    'profile.agePlaceholder': 'e.g. 30',
    'profile.gender': 'Gender',
    'profile.male': 'Male',
    'profile.female': 'Female',
    'profile.activityLevel': 'Activity level',
    'profile.low': 'Low',
    'profile.medium': 'Medium',
    'profile.high': 'High',
    'profile.saveSettings': 'Save settings',
    'profile.updateSettings': 'Update settings',
    'settings.title': 'Settings',
    'settings.loading': 'Loading settings...',
    'settings.language': 'Language',
    'settings.english': 'English',
    'settings.lithuanian': 'Lietuvių',
    'settings.waterReminder': 'Water reminder',
    'settings.remindMe': 'Remind me to drink water',
    'settings.hours': 'Hours',
    'settings.minutes': 'Minutes',
    'settings.statisticsData': 'Statistics data',
    'settings.clearStatistics': 'Clear statistics',
    'settings.userSettings': 'User settings',
    'settings.clearUserSettings': 'Clear user settings',
    'settings.appInformation': 'App information',
    'settings.useAtLeastMinute': 'Use at least 1 minute',
    'settings.notificationsDenied': 'Notifications permission denied',
    'settings.reminderDisabled': '✓ Water reminder disabled',
    'settings.reminderSaved': '✓ Water reminder saved',
    'settings.settingsCleared': '✓ Settings cleared',
    'settings.statisticsCleared': '✓ Statistics cleared',
    'statistics.title': 'Statistics',
    'statistics.loading': 'Loading statistics...',
    'statistics.today': 'Today',
    'statistics.thisWeek': 'This week',
    'statistics.thisMonth': 'This month',
    'statistics.thisYear': 'This year',
    'statistics.allTime': 'All time',
    'statistics.swipe': '← Swipe sideways →',
    'week.mon': 'Mon',
    'week.tue': 'Tue',
    'week.wed': 'Wed',
    'week.thu': 'Thu',
    'week.fri': 'Fri',
    'week.sat': 'Sat',
    'week.sun': 'Sun',
    'month.jan': 'Jan',
    'month.feb': 'Feb',
    'month.mar': 'Mar',
    'month.apr': 'Apr',
    'month.may': 'May',
    'month.jun': 'Jun',
    'month.jul': 'Jul',
    'month.aug': 'Aug',
    'month.sep': 'Sep',
    'month.oct': 'Oct',
    'month.nov': 'Nov',
    'month.dec': 'Dec',
    'support.title': 'Support this app',
    'support.message':
      'If you enjoy using Drink Water, you can support the developer and help improve the app.',
    'support.highlight': 'Every coffee helps',
    'support.footer': 'Secure payment via Ko-fi',
    'terms.question': 'Do you agree to the app terms?',
    'terms.agree': 'I agree',
    'terms.disagree': 'I do not agree',
    'disclaimer.title': 'Disclaimer',
    'disclaimer.body':
      'Drink Water is designed for general information and reminder purposes only. It is not medical advice, diagnosis, or treatment.\n\nThe daily water goal shown in this app is only an estimate based on the information you provide, such as weight, gender, activity level, and optional age.\n\nIndividual hydration needs can vary depending on health conditions, medication, climate, diet, pregnancy, physical activity, and other factors.\n\nIf you need accurate personal hydration advice, please consult a qualified healthcare professional.\n\nBy using this app, you understand that you are responsible for your own health decisions. The developer is not responsible for any health issues, losses, or damages related to the use of this app.',
    'privacy.title': 'Privacy Policy',
    'privacy.body':
      'Drink Water does not collect, store, or send your personal information to any external server.\n\nThe app does not use an external database, user account system, or cloud storage.\n\nAny information you enter, such as weight, gender, activity level, or optional age, is stored locally on your device only. This information is used only inside the app to calculate an estimated daily water goal and improve your personal experience.\n\nThe developer cannot see, access, or collect your personal data.\n\nYou can use the app without entering personal profile information. If you choose not to provide this information, the app will use default values.\n\nYou can clear your profile settings and statistics data at any time from the Settings screen.\n\nDrink Water is intended for general information and reminder purposes only. It is not medical advice, diagnosis, or treatment.\n\nBy using this app, you understand that you are responsible for your own health decisions and for the information you choose to enter.',
    'how.title': 'How to use',
    'how.body':
      'Use this app to track your daily water intake, set your profile information, view your daily progress, check statistics, and enable optional water reminder notifications.\n\nThe app helps you stay aware of your hydration habits, but it should not replace professional medical advice.',
    'how.profileText': 'Set weight, gender, activity level, and optional age.',
    'how.homeText': 'Choose or type water amount and press Add water.',
    'how.statisticsText':
      'Review daily, weekly, monthly, yearly, and all-time progress.',
    'how.settingsText':
      'Manage reminders, clear data, and access support/info pages.',
  },
  lt: {
    'app.name': 'Drink Water',
    'nav.home': 'Pradžia',
    'nav.statistics': 'Statistika',
    'nav.profile': 'Profilis',
    'nav.settings': 'Nustatymai',
    'nav.terms': 'Sąlygos',
    'nav.support': 'Palaikymas',
    'nav.disclaimer': 'Atsakomybės ribojimas',
    'nav.howToUse': 'Kaip naudoti',
    'nav.privacyPolicy': 'Privatumo politika',
    back: 'Atgal',
    save: 'Išsaugoti',
    update: 'Atnaujinti',
    saved: '✓ Išsaugota',
    updated: '✓ Atnaujinta',
    on: 'ĮJ.',
    off: 'IŠJ.',
    'home.waterReminder': 'Vandens\npriminimas',
    'home.today': 'Šiandien',
    'home.dailyGoal': 'Dienos tikslas',
    'home.selectedAmount': 'Pasirinktas kiekis',
    'home.addWater': 'Pridėti vandenį',
    'notification.title': 'Drink Water',
    'notification.body': 'Laikas išgerti vandens.',
    'status.low': 'mažai',
    'status.medium': 'vidutiniškai',
    'status.good': 'gerai',
    'status.perfect': 'puiku',
    'profile.title': 'Profilis',
    'profile.weight': 'Svoris',
    'profile.enterWeight': 'Įveskite svorį',
    'profile.age': 'Amžius',
    'profile.agePlaceholder': 'pvz. 30',
    'profile.gender': 'Lytis',
    'profile.male': 'Vyras',
    'profile.female': 'Moteris',
    'profile.activityLevel': 'Aktyvumo lygis',
    'profile.low': 'Žemas',
    'profile.medium': 'Vidutinis',
    'profile.high': 'Aukštas',
    'profile.saveSettings': 'Išsaugoti nustatymus',
    'profile.updateSettings': 'Atnaujinti nustatymus',
    'settings.title': 'Nustatymai',
    'settings.loading': 'Įkeliami nustatymai...',
    'settings.language': 'Kalba',
    'settings.english': 'English',
    'settings.lithuanian': 'Lietuvių',
    'settings.waterReminder': 'Vandens priminimas',
    'settings.remindMe': 'Priminti išgerti vandens',
    'settings.hours': 'Valandos',
    'settings.minutes': 'Minutės',
    'settings.statisticsData': 'Statistikos duomenys',
    'settings.clearStatistics': 'Išvalyti statistiką',
    'settings.userSettings': 'Vartotojo nustatymai',
    'settings.clearUserSettings': 'Išvalyti vartotojo nustatymus',
    'settings.appInformation': 'Programėlės informacija',
    'settings.useAtLeastMinute': 'Naudokite bent 1 minutę',
    'settings.notificationsDenied': 'Pranešimų leidimas atmestas',
    'settings.reminderDisabled': '✓ Vandens priminimas išjungtas',
    'settings.reminderSaved': '✓ Vandens priminimas išsaugotas',
    'settings.settingsCleared': '✓ Nustatymai išvalyti',
    'settings.statisticsCleared': '✓ Statistika išvalyta',
    'statistics.title': 'Statistika',
    'statistics.loading': 'Įkeliama statistika...',
    'statistics.today': 'Šiandien',
    'statistics.thisWeek': 'Šią savaitę',
    'statistics.thisMonth': 'Šį mėnesį',
    'statistics.thisYear': 'Šiais metais',
    'statistics.allTime': 'Visas laikas',
    'statistics.swipe': '← Braukite į šonus →',
    'week.mon': 'Pr',
    'week.tue': 'An',
    'week.wed': 'Tr',
    'week.thu': 'Kt',
    'week.fri': 'Pn',
    'week.sat': 'Št',
    'week.sun': 'Sk',
    'month.jan': 'Sau',
    'month.feb': 'Vas',
    'month.mar': 'Kov',
    'month.apr': 'Bal',
    'month.may': 'Geg',
    'month.jun': 'Bir',
    'month.jul': 'Lie',
    'month.aug': 'Rgp',
    'month.sep': 'Rgs',
    'month.oct': 'Spa',
    'month.nov': 'Lap',
    'month.dec': 'Gru',
    'support.title': 'Palaikykite programėlę',
    'support.message':
      'Jei jums patinka naudoti Drink Water, galite paremti kūrėją ir padėti tobulinti programėlę.',
    'support.highlight': 'Kiekviena kava padeda',
    'support.footer': 'Saugus mokėjimas per Ko-fi',
    'terms.question': 'Ar sutinkate su programėlės sąlygomis?',
    'terms.agree': 'Sutinku',
    'terms.disagree': 'Nesutinku',
    'disclaimer.title': 'Atsakomybės ribojimas',
    'disclaimer.body':
      'Drink Water skirta tik bendrai informacijai ir priminimams. Tai nėra medicininis patarimas, diagnozė ar gydymas.\n\nProgramėlėje rodomas dienos vandens tikslas yra tik apytikslis įvertinimas pagal jūsų pateiktą informaciją, pvz., svorį, lytį, aktyvumo lygį ir pasirenkamą amžių.\n\nIndividualūs hidratacijos poreikiai gali skirtis dėl sveikatos būklės, vaistų, klimato, mitybos, nėštumo, fizinio aktyvumo ir kitų veiksnių.\n\nJei reikia tikslaus asmeninio patarimo dėl hidratacijos, kreipkitės į kvalifikuotą sveikatos priežiūros specialistą.\n\nNaudodami šią programėlę suprantate, kad patys atsakote už savo sveikatos sprendimus. Kūrėjas neatsako už jokias sveikatos problemas, nuostolius ar žalą, susijusią su šios programėlės naudojimu.',
    'privacy.title': 'Privatumo politika',
    'privacy.body':
      'Drink Water nerenka, nesaugo ir nesiunčia jūsų asmeninės informacijos į jokį išorinį serverį.\n\nProgramėlė nenaudoja išorinės duomenų bazės, vartotojo paskyrų sistemos ar debesijos saugyklos.\n\nBet kokia jūsų įvesta informacija, pvz., svoris, lytis, aktyvumo lygis ar pasirenkamas amžius, saugoma tik jūsų įrenginyje. Ši informacija naudojama tik programėlėje apskaičiuoti apytikslį dienos vandens tikslą ir pagerinti asmeninę patirtį.\n\nKūrėjas negali matyti, pasiekti ar rinkti jūsų asmeninių duomenų.\n\nProgramėlę galite naudoti neįvesdami asmeninės profilio informacijos. Jei nuspręsite jos nepateikti, programėlė naudos numatytąsias reikšmes.\n\nSavo profilio nustatymus ir statistikos duomenis galite bet kada išvalyti Nustatymų ekrane.\n\nDrink Water skirta tik bendrai informacijai ir priminimams. Tai nėra medicininis patarimas, diagnozė ar gydymas.\n\nNaudodami šią programėlę suprantate, kad patys atsakote už savo sveikatos sprendimus ir už informaciją, kurią pasirenkate įvesti.',
    'how.title': 'Kaip naudoti',
    'how.body':
      'Naudokite šią programėlę kasdieniam vandens suvartojimui sekti, profilio informacijai nustatyti, dienos pažangai peržiūrėti, statistikai tikrinti ir pasirenkamiems vandens priminimams įjungti.\n\nProgramėlė padeda geriau pastebėti hidratacijos įpročius, bet neturėtų pakeisti profesionalios medicininės konsultacijos.',
    'how.profileText':
      'Nustatykite svorį, lytį, aktyvumo lygį ir pasirenkamą amžių.',
    'how.homeText':
      'Pasirinkite arba įveskite vandens kiekį ir paspauskite Pridėti vandenį.',
    'how.statisticsText':
      'Peržiūrėkite dienos, savaitės, mėnesio, metų ir viso laiko pažangą.',
    'how.settingsText':
      'Tvarkykite priminimus, išvalykite duomenis ir atidarykite palaikymo ar informacijos puslapius.',
  },
} as const;

const I18nContext = createContext<I18nContextValue>({
  hasLoadedLanguage: false,
  language: 'en',
  setLanguage: async () => {},
  t: (key) => translations.en[key] ?? key,
});

const normalizeLanguage = (language: string | null | undefined): AppLanguage =>
  language?.toLowerCase().startsWith('lt') ? 'lt' : 'en';

const getDeviceLanguage = () => {
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    return settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
  }

  return (
    NativeModules.I18nManager?.localeIdentifier ??
    NativeModules.I18nManager?.locale
  );
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [hasLoadedLanguage, setHasLoadedLanguage] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem(appLanguageStorageKey);
      const nextLanguage =
        savedLanguage === 'en' || savedLanguage === 'lt'
          ? savedLanguage
          : normalizeLanguage(getDeviceLanguage());

      if (savedLanguage !== 'en' && savedLanguage !== 'lt') {
        await AsyncStorage.setItem(appLanguageStorageKey, nextLanguage);
      }

      setLanguageState(nextLanguage);
      setHasLoadedLanguage(true);
    };

    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    await AsyncStorage.setItem(appLanguageStorageKey, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? translations.en[key],
    [language]
  );

  const value = useMemo(
    () => ({ hasLoadedLanguage, language, setLanguage, t }),
    [hasLoadedLanguage, language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
