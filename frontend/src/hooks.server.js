/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // --- TESTBRUKER ---
    // Denne koden simulerer at brukeren 'apendag' alltid er logget inn.
    // Dette er kun for testing.
    // Fjern eller kommenter ut dette når du har et ekte innloggingssystem.
    event.locals.user = {
        id: '3633537c-caca-441c-a330-75a115cd9ef2', // ID-en til testbrukeren 'apendag'
        navn: 'Henrik',
        email: 'helua011@osloskolen.no'
    };
    // --- SLUTT PÅ TESTBRUKER ---

    // Fortsetter til SvelteKits vanlige håndtering av forespørselen
    return resolve(event);
}
