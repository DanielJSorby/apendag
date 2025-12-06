/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // --- TESTBRUKER ---
    // Denne koden simulerer at brukeren 'apendag' alltid er logget inn.
    // Dette er kun for testing.
    // Fjern eller kommenter ut dette når du har et ekte innloggingssystem.
    event.locals.user = {
        id: '334b292c-63bc-4fb6-8253-b78d49f889d4', // ID-en til testbrukeren 'apendag'
        navn: 'apendag',
        email: 'elvapendag@gmail.com'
    };
    // --- SLUTT PÅ TESTBRUKER ---

    // Fortsetter til SvelteKits vanlige håndtering av forespørselen
    return resolve(event);
}
