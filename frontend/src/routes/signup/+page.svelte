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
                successMessage = 'Verification link sent! Please check your email to complete signup.';
                errorMessage = ''; // Clear any errors
                name = ''; // Clear inputs after sending
                email = ''; // Clear inputs after sending
            } else {
                errorMessage = data.message || 'Failed to send verification link';
                successMessage = ''; // Clear success message on error
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'An error occurred while creating your account';
            successMessage = ''; // Clear success message on error
        }
    }
</script>

<div class="login">
    <div class="container">
        <div class="header">
            <h1>Sign Up</h1>
            <p>Create an account to get started</p>
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
            <label for="name">Name</label>
            <input type="text" id="name" placeholder="John Doe" bind:value={name} required />
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required />
            <button class="button filled" type="submit">Sign Up</button>
        </form>
        <div class="bottom-message">
            <p>Already have an account? <a href="/login">Log in</a></p>
        </div>
    </div>
</div>

<style>
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