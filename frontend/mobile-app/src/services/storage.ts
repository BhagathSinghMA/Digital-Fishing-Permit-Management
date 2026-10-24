import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'fisher_auth_token',
  USER_ROLE: 'fisher_user_role',
  USER_ID: 'fisher_user_id',
  USER_DATA: 'fisher_user_data',
  IS_LOGGED_IN: 'fisher_is_logged_in',
};

export type UserRole = 'boat_owner' | 'fisherman';

export interface StoredAuthData {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
  userData: any | null;
  isLoggedIn: boolean;
}

// In-memory fallback cache
const memoryStore: Record<string, string> = {};

const setItem = async (key: string, value: string): Promise<void> => {
  memoryStore[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[Storage] Warning saving key "${key}":`, error);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) return val;
  } catch (error) {
    console.warn(`[Storage] Warning reading key "${key}":`, error);
  }
  return memoryStore[key] || null;
};

const removeItem = async (key: string): Promise<void> => {
  delete memoryStore[key];
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage] Warning removing key "${key}":`, error);
  }
};

/**
 * Save authentication data persistently to local storage
 */
export const saveAuthData = async (data: {
  token: string;
  role: UserRole;
  userId: string;
  userData?: any;
}): Promise<void> => {
  try {
    await Promise.all([
      setItem(KEYS.AUTH_TOKEN, data.token),
      setItem(KEYS.USER_ROLE, data.role),
      setItem(KEYS.USER_ID, data.userId),
      setItem(KEYS.IS_LOGGED_IN, 'true'),
      data.userData ? setItem(KEYS.USER_DATA, JSON.stringify(data.userData)) : Promise.resolve(),
    ]);
  } catch (error) {
    console.error('[Storage] Failed to save authentication data:', error);
    throw error;
  }
};

/**
 * Retrieve all saved authentication data
 */
export const getAuthData = async (): Promise<StoredAuthData> => {
  try {
    const [token, role, userId, userDataRaw, isLoggedInRaw] = await Promise.all([
      getItem(KEYS.AUTH_TOKEN),
      getItem(KEYS.USER_ROLE),
      getItem(KEYS.USER_ID),
      getItem(KEYS.USER_DATA),
      getItem(KEYS.IS_LOGGED_IN),
    ]);

    let parsedUserData: any = null;
    if (userDataRaw) {
      try {
        parsedUserData = JSON.parse(userDataRaw);
      } catch {
        parsedUserData = null;
      }
    }

    const isLoggedIn = isLoggedInRaw === 'true' && !!token && !!role && !!userId;

    return {
      token: token || null,
      role: (role as UserRole) || null,
      userId: userId || null,
      userData: parsedUserData,
      isLoggedIn,
    };
  } catch (error) {
    console.error('[Storage] Failed to load authentication data:', error);
    return {
      token: null,
      role: null,
      userId: null,
      userData: null,
      isLoggedIn: false,
    };
  }
};

/**
 * Get just the saved auth token (useful for API interceptors)
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await getItem(KEYS.AUTH_TOKEN);
};

/**
 * Clear all authentication and session data on logout or invalid token
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      removeItem(KEYS.AUTH_TOKEN),
      removeItem(KEYS.USER_ROLE),
      removeItem(KEYS.USER_ID),
      removeItem(KEYS.USER_DATA),
      removeItem(KEYS.IS_LOGGED_IN),
    ]);
  } catch (error) {
    console.error('[Storage] Failed to clear authentication data:', error);
  }
};
