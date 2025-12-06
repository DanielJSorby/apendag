// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string; // Endret fra number til string for å matche UUID i databasen
				navn: string;
				email: string;
			} | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
