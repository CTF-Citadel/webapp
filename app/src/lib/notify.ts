import { writable } from 'svelte/store';

// Toast Event Store
export const notifyState: any = writable({ active: false, message: '', error: false });

/// Toaster
export function newNotify(message: string, error: boolean) {
    notifyState.set({
        active: false,
        message: message,
        error: error
    });
    notifyState.set({
        active: true,
        message: message,
        error: error
    });
    setTimeout(() => {
        notifyState.set({
            active: false,
            message: message,
            error: error
        });
    }, 3000);
}
