import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { InteractionManager } from 'react-native';
import { GOOGLE_CONFIG } from '../config/google';

class GoogleAuthService {
    private static instance: GoogleAuthService;
    private isConfigured: boolean = false;
    private configurationPromise: Promise<void> | null = null;

    private constructor() {
        // Don't configure immediately, wait for proper initialization
    }

    public static getInstance(): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService();
        }
        return GoogleAuthService.instance;
    }

    private async configure(): Promise<void> {
        if (this.isConfigured) {
            return;
        }

        if (this.configurationPromise) {
            return this.configurationPromise;
        }

        this.configurationPromise = new Promise<void>((resolve) => {
            // Wait for all interactions to complete (ensures Activity is ready)
            InteractionManager.runAfterInteractions(() => {
                try {
                    GoogleSignin.configure({
                        webClientId: GOOGLE_CONFIG.webClientId,
                        offlineAccess: true,
                        scopes: GOOGLE_CONFIG.scopes,
                    });
                    this.isConfigured = true;
                    console.log('Google Sign-In configured successfully');
                    resolve();
                } catch (error) {
                    console.error('Google Sign-In configuration error:', error);
                    resolve(); // Resolve anyway to avoid hanging
                }
            });
        });

        return this.configurationPromise;
    }

    async signIn() {
        try {
            console.log('=== Google Sign-In Start ===');

            // Ensure Google Sign-In is configured
            await this.configure();

            // Additional delay to ensure Activity is fully ready
            await new Promise(resolve => setTimeout(resolve, 300));

            console.log('Checking Play Services...');
            const hasPlayServices = await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true
            });

            if (!hasPlayServices) {
                throw new Error('Play Services not available');
            }

            console.log('Starting Google Sign-In...');
            const result = await GoogleSignin.signIn();

            console.log('Google Sign-In SUCCESS');
            console.log('Result type:', typeof result);
            console.log('Result keys:', result ? Object.keys(result) : 'null');
            console.log('Full result:', JSON.stringify(result, null, 2));

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
            console.error('=== Google Sign-In FAILED ===');
            console.error('Error type:', typeof error);
            console.error('Error code:', error?.code);
            console.error('Error message:', error?.message);
            console.error('Full error:', JSON.stringify(error, null, 2));

            let errorMessage = 'Failed to sign in with Google';

            // Handle specific error codes
            if (error.code === 'SIGN_IN_CANCELLED') {
                errorMessage = 'Sign-in was cancelled';
            } else if (error.code === 'IN_PROGRESS') {
                errorMessage = 'Sign-in already in progress';
            } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
                errorMessage = 'Play Services not available';
            } else if (error.code === 'RNGoogleSignin' && error.message?.includes('activity')) {
                errorMessage = 'App not ready. Please try again in a moment';
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage,
                errorCode: error?.code,
            };
        }
    }

    async signOut() {
        try {
            // Ensure configured before sign out
            await this.configure();
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
