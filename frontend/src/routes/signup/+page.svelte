<script lang="ts">
    import { onMount } from 'svelte';
    import { getCookie } from '$lib/functions/getCookie';
    let name = $state('');
    let email = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let successMessage = $state('');

    onMount(async () => {
        const userId = getCookie('UserId');
        if (userId) {
            window.location.href = '/';
        }
    });

    async function handleSubmit() {
        try {
            errorMessage = '';
            successMessage = '';
            
            const response = await fetch('/api/signup_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email }),
            });
            
            const data = await response.json();
            
            if (data.ok) {
                successMessage = 'Verifiseringslenke er sendt! Sjekk e-posten din for å fullføre registreringen.';
                errorMessage = ''; // Clear any errors
                name = ''; // Clear inputs after sending
                email = ''; // Clear inputs after sending
            } else {
                errorMessage = data.message || 'Kunne ikke sende verifiseringslenke';
                successMessage = ''; // Clear success message on error
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Et problem oppstod ved oppretting av kontoen din';
            successMessage = ''; // Clear success message on error
        }
    }
</script>

<div class="login">
    <div class="container">
        <div class="header">
            <h1>Registrer deg</h1>
            <p>Opprett en konto for å melde deg på kurs. Du vil bli tilsendt en verifiseringslenke på e-post. Informasjonen brukes kun av rådgivere for å holde orden på påmelding av kurs og slettes etter åpen dag.</p>
        </div>
        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}
        {#if successMessage}
            <div class="success-message">
                {successMessage}
            </div>
        {/if}
        <form on:submit|preventDefault={handleSubmit}>
            <label for="name">Fullt navn</label>
            <input type="text" id="name" placeholder="John Doe" bind:value={name} required />
            <label for="email">E-post</label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required />
            <button class="button filled" type="submit">Registrer deg</button>
        </form>
        <div class="bottom-message">
            <p>Har du allerede en konto? <a href="/login">Logg inn</a></p>
        </div>
    </div>
</div>

<div class="background-shapes">
		<div class="shape shape-1"></div>
		<div class="shape shape-2"></div>
		<div class="shape shape-3"></div>
		<div class="shape shape-4"></div>
	</div>

<style>
    .background-shapes {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: -200;
	}

	.shape {
		position: absolute;
		border-radius: 50%;
		opacity: 0.1;
		animation: float 20s ease-in-out infinite;
	}

	.shape-1 {
		width: 300px;
		height: 300px;
		background: var(--color-blue);
		top: -150px;
		left: -150px;
		animation-delay: 0s;
	}

	.shape-2 {
		width: 200px;
		height: 200px;
		background: var(--color-pink);
		top: 20%;
		right: -100px;
		animation-delay: -5s;
	}

	.shape-3 {
		width: 250px;
		height: 250px;
		background: var(--color-green);
		bottom: -125px;
		left: 10%;
		animation-delay: -10s;
	}

	.shape-4 {
		width: 180px;
		height: 180px;
		background: var(--color-orange);
		bottom: 10%;
		right: 15%;
		animation-delay: -15s;
	}

	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}
    
    .error-message {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    }

    .success-message {
        background-color: #f0fdf4;
        border: 1px solid #86efac;
        color: #166534;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    }

    .bottom-message {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
        text-align: center;
        font-size: 20px;
        font-weight: 100;
    }

    .bottom-message a {
        color: #1d40b0;
        text-decoration: underline;
    }

    .login {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .container {
        width: 100%;
        max-width: 800px;
        padding: 2rem;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        border: 1px solid #1d40b0;
	    border-style: dashed;
        overflow: hidden;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .header {
        background-color: #1d40b0;
        color: #fff;
        padding: 1rem;
        border: 1px solid #1d40b0;
	    border-style: dashed;
        margin: -2em;
        margin-bottom: 2em;
        padding: 2em;
    }

    .header h1 {
        font-size: 52px;
    }

    .header p {
        font-size: 20px;
        font-weight: 100;
    }
</style>