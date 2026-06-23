import Constants from 'expo-constants';

/**
 * Set `EXPO_PUBLIC_LEARN_HUB_API_URL` in `.env` or `expo.extra.learnHubApiUrl` in app.json.
 * Example: https://api.example.com/v1/learn-hub
 */
export function getLearnHubApiBaseUrl(): string | null {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_LEARN_HUB_API_URL
      ? String(process.env.EXPO_PUBLIC_LEARN_HUB_API_URL).replace(/\/$/, '')
      : '';
  const fromExtra = Constants.expoConfig?.extra?.learnHubApiUrl as string | undefined;
  const base = (fromEnv || fromExtra || '').replace(/\/$/, '');
  return base.length > 0 ? base : null;
}
