/**
 * Checks if an email domain is in the disposable email blocklist
 * Uses the list from: https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/refs/heads/main/disposable_email_blocklist.conf
 */

let disposableDomainsCache: Set<string> | null = null;
let cacheFetchPromise: Promise<Set<string>> | null = null;

async function fetchDisposableDomains(): Promise<Set<string>> {
    // If already fetching, return the same promise
    if (cacheFetchPromise) {
        return cacheFetchPromise;
    }

    // If cached, return cache
    if (disposableDomainsCache) {
        return disposableDomainsCache;
    }

    // Start fetching
    cacheFetchPromise = (async () => {
        try {
            const response = await fetch(
                'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/refs/heads/main/disposable_email_blocklist.conf'
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch disposable email list: ${response.status}`);
            }

            const text = await response.text();
            const domains = text
                .split('\n')
                .map(line => line.trim().toLowerCase())
                .filter(line => line && !line.startsWith('#'));

            disposableDomainsCache = new Set(domains);
            cacheFetchPromise = null; // Clear promise after completion
            return disposableDomainsCache;
        } catch (error) {
            console.error('[DISPOSABLE EMAIL] Failed to fetch blocklist:', error);
            // Return empty set on error to allow emails through (fail open)
            disposableDomainsCache = new Set();
            cacheFetchPromise = null;
            return disposableDomainsCache;
        }
    })();

    return cacheFetchPromise;
}

/**
 * Extracts the domain from an email address
 */
function extractDomain(email: string): string {
    const parts = email.toLowerCase().trim().split('@');
    if (parts.length !== 2) {
        throw new Error('Invalid email format');
    }
    return parts[1];
}

/**
 * Checks if an email address uses a disposable email domain
 * @param email - The email address to check
 * @returns true if the email domain is in the disposable blocklist
 */
export async function isDisposableEmail(email: string): Promise<boolean> {
    try {
        const domain = extractDomain(email);
        const disposableDomains = await fetchDisposableDomains();
        return disposableDomains.has(domain);
    } catch (error) {
        console.error('[DISPOSABLE EMAIL] Error checking email:', error);
        // Fail open - if we can't check, allow the email through
        return false;
    }
}

