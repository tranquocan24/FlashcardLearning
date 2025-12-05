import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CONFIG } from '../config/google';

class GoogleAuthService {
    private static instance: GoogleAuthService;

    private constructor() {
        this.configure();
    }

    public static getInstance(): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService();
        }
        return GoogleAuthService.instance;
    }

    private configure() {
        try {
            GoogleSignin.configure({
                webClientId: GOOGLE_CONFIG.webClientId,
                offlineAccess: true,
                scopes: GOOGLE_CONFIG.scopes,
            });
        } catch (error) {
            console.error('Google Sign-In configuration error:', error);
        }
    }

    async signIn() {
        try {
            console.log('Checking Play Services...');
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            console.log('Starting Google Sign-In...');
            const result = await GoogleSignin.signIn();

            console.log('Google Sign-In raw result:', JSON.stringify(result, null, 2));

            if (!result) {
                return {
                    success: false,
                    error: 'No data returned from Google Sign-In',
                };
            }

            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to sign in with Google',
            };
        }
    }

    async signOut() {
        try {
            await GoogleSignin.signOut();
            return { success: true };
        } catch (error: any) {
            console.error('Google Sign-Out Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to sign out',
            };
        }
    }

    async getCurrentUser() {
        try {
            const userInfo = await GoogleSignin.signInSilently();
            return {
                success: true,
                data: userInfo,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'No user signed in',
            };
        }
    }

    async isSignedIn() {
        try {
            const user = GoogleSignin.getCurrentUser();
            return user !== null;
        } catch {
            return false;
        }
    }
}

export default GoogleAuthService.getInstance();
