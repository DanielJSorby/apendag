<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getCookie } from '$lib/functions/getCookie';
    let name = $state('');
    let email = $state('');
    let telefon = $state('');
    let errorMessage = $state('');
    let successMessage = $state('');
    let schools = $state<Array<{id: string, navn: string}>>([]);
    let schoolSearch = $state('');
    let selectedSchool = $state<string | null>(null);
    let customSchool = $state('');
    let showSchoolDropdown = $state(false);
    let showCustomInput = $state(false);
    // Store last submitted data for resending
    let lastSubmittedData = $state<{name: string, email: string, telefon: string, ungdomskole: string, selectedSchool: string | null, customSchool: string, showCustomInput: boolean} | null>(null);
    let isResending = $state(false);
    let lastSentTime = $state<number | null>(null); // Timestamp when link was sent
    let timeRemaining = $state(0); // Seconds remaining until resend is allowed
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    onMount(async () => {
        const userId = getCookie('UserId');
        if (userId) {
            window.location.href = '/';
        }
        loadSchools();
    });

    onDestroy(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });

    function startCountdown() {
        lastSentTime = Date.now();
        timeRemaining = 60; // 1 minute in seconds
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            if (lastSentTime) {
                const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
                timeRemaining = Math.max(0, 60 - elapsed);
                
                if (timeRemaining <= 0) {
                    if (countdownInterval) {
                        clearInterval(countdownInterval);
                        countdownInterval = null;
                    }
                }
            }
        }, 1000);
    }

    async function loadSchools() {
        try {
            const response = await fetch('/api/admin/skoler');
            const data = await response.json();
            schools = Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error loading schools:', error);
        }
    }

    function filteredSchools() {
        if (!schoolSearch) return schools;
        const searchLower = schoolSearch.toLowerCase();
        return schools.filter(school => 
            school.navn.toLowerCase().includes(searchLower)
        );
    }

    function selectSchool(schoolName: string) {
        if (schoolName === 'Annet') {
            showCustomInput = true;
            selectedSchool = null;
            schoolSearch = '';
        } else {
            selectedSchool = schoolName;
            schoolSearch = schoolName;
            showCustomInput = false;
        }
        showSchoolDropdown = false;
    }

    function getSelectedSchoolName(): string {
        if (showCustomInput && customSchool) {
            return customSchool;
        }
        return selectedSchool || '';
    }

    async function handleSubmit(submittedData?: typeof lastSubmittedData) {
        try {
            errorMessage = '';
            successMessage = '';
            
            // Use submitted data if provided (for resending), otherwise use current form values
            const formData = submittedData || {
                name,
                email,
                telefon,
                ungdomskole: getSelectedSchoolName(),
                selectedSchool,
                customSchool,
                showCustomInput
            };
            
            const ungdomskole = formData.ungdomskole;
            
            if (!ungdomskole || ungdomskole.trim() === '') {
                errorMessage = 'Vennligst velg eller skriv inn ungdomskole';
                return;
            }
            
            if (!formData.telefon || formData.telefon.trim() === '') {
                errorMessage = 'Telefonnummer er påkrevd';
                return;
            }
            
            const response = await fetch('/api/signup_link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email, 
                    ungdomskole: ungdomskole.trim(),
                    telefon: formData.telefon.trim()
                }),
            });
            
            const data = await response.json();
            
            if (data.ok) {
                // Store submitted data for potential resending
                lastSubmittedData = {
                    name: formData.name,
                    email: formData.email,
                    telefon: formData.telefon,
                    ungdomskole: formData.ungdomskole,
                    selectedSchool: formData.selectedSchool,
                    customSchool: formData.customSchool,
                    showCustomInput: formData.showCustomInput
                };
                
                successMessage = `Verifiseringslenke er sendt til ${formData.email}! Sjekk e-post/søppelpost for å fullføre registreringen.`;
                errorMessage = '';
                
                // Only clear form if this is a new submission, not a resend
                if (!submittedData) {
                    name = '';
                    email = '';
                    telefon = '';
                    selectedSchool = null;
                    customSchool = '';
                    schoolSearch = '';
                    showCustomInput = false;
                }
                isResending = false;
                startCountdown(); // Start the 1-minute countdown
            } else {
                errorMessage = data.message || 'Kunne ikke sende verifiseringslenke';
                successMessage = '';
                isResending = false;
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Et problem oppstod ved oppretting av kontoen din';
            successMessage = '';
            isResending = false;
        }
    }

    async function resendLink() {
        if (!lastSubmittedData || timeRemaining > 0) return;
        isResending = true;
        await handleSubmit(lastSubmittedData);
    }

    function getResendButtonText(): string {
        if (isResending) return 'Sender...';
        if (timeRemaining > 0) return `Send ny link (${timeRemaining}s)`;
        return 'Send ny link';
    }
</script>

<div class="login">
    <div class="container">
        <div class="spacer"></div>
        <div class="header">
            <h1>Registrer deg</h1>
            <p>Opprett en konto for å melde deg på kurs. Du vil bli tilsendt en verifiseringslenke på e-post. Informasjonen din brukes kun av rådgivere for å holde orden på påmelding av kurs og slettes etter åpen dag.</p>
        </div>
        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}
        {#if successMessage}
            <div class="success-message">
                <div>{successMessage}</div>
                <button type="button" class="resend-button" onclick={resendLink} disabled={isResending || timeRemaining > 0}>
                    {getResendButtonText()}
                </button>
            </div>
        {/if}
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label for="name">Fullt navn <span style="color: var(--color-pink);">*</span></label>
            <input type="text" id="name" placeholder="John Doe" bind:value={name} required />
            
            <label for="email">E-post <span style="color: var(--color-pink);">*</span></label>
            <input type="email" id="email" placeholder="john@email.com" bind:value={email} required />
            
            <label for="school">Ungdomsskole <span style="color: var(--color-pink);">*</span></label>
            <div class="school-selector">
                <input 
                    type="text" 
                    id="school" 
                    placeholder="Søk eller velg skole..." 
                    bind:value={schoolSearch}
                    onfocus={() => showSchoolDropdown = true}
                    oninput={() => {
                        if (schoolSearch && !showCustomInput) {
                            showSchoolDropdown = true;
                        }
                    }}
                    autocomplete="off"
                    required={!showCustomInput}
                    aria-required="true"
                />
                {#if showSchoolDropdown && !showCustomInput}
                    <div class="school-dropdown">
                        {#if filteredSchools().length > 0}
                            {#each filteredSchools() as school}
                                <div 
                                    class="school-option"
                                    onclick={() => selectSchool(school.navn)}
                                    role="button"
                                    tabindex="0"
                                    onkeydown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            selectSchool(school.navn);
                                        }
                                    }}
                                >
                                    {school.navn}
                                </div>
                            {/each}
                        {/if}
                        <div 
                            class="school-option school-option-other"
                            onclick={() => selectSchool('Annet')}
                            role="button"
                            tabindex="0"
                            onkeydown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    selectSchool('Annet');
                                }
                            }}
                        >
                            Annet...
                        </div>
                    </div>
                {/if}
                {#if showCustomInput}
                    <input 
                        type="text" 
                        class="custom-school-input"
                        placeholder="Skriv inn skolenavn"
                        bind:value={customSchool}
                        required
                        aria-required="true"
                    />
                {/if}
            </div>
            
            <label for="telefon">Telefonnummer <span style="color: var(--color-pink);">*</span></label>
            <input 
                type="tel" 
                id="telefon" 
                placeholder="123 45 678" 
                bind:value={telefon}
                required
            />
            
            <button type="submit">Registrer deg</button>
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
    .login {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 10vh);
        padding: 2rem 1rem;
        background-color: var(--color-grey);
        position: relative;
    }

    .container {
        width: 100%;
        max-width: 500px;
        padding: 3rem;
        background-color: var(--color-white);
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 2;
    }

    .header {
        text-align: left;
        margin-bottom: 2rem;
    }

    .header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        color: var(--color-pink);
        font-weight: bold;
    }

    .spacer {
        height: 3rem;
    }

    .header p {
        font-size: 1rem;
        margin: 0;
        color: #333;
        font-weight: 300;
        line-height: 1.5;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    label {
        font-size: 1rem;
        font-weight: 500;
        color: #333;
        margin-bottom: -1rem;
    }

    input {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 15px;
        font-size: 1rem;
        font-family: 'Oslo Sans', sans-serif;
        transition: border-color 0.3s, box-shadow 0.3s;
        background-color: var(--color-white);
    }

    input:focus {
        outline: none;
        border-color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
    }

    input::placeholder {
        color: #999;
    }

    .school-selector {
        position: relative;
    }

    .school-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--color-white);
        border: 2px solid var(--color-pink);
        border-radius: 15px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .school-option {
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid #f0f0f0;
    }

    .school-option:last-child {
        border-bottom: none;
    }

    .school-option:hover,
    .school-option:focus {
        background-color: var(--color-pink-light);
        outline: none;
    }

    .school-option-other {
        font-weight: 500;
        color: var(--color-pink);
        border-top: 2px solid #f0f0f0;
    }

    .custom-school-input {
        margin-top: 8px;
    }

    button {
        padding: 12px 24px;
        border: 2px solid var(--color-pink);
        border-radius: 15px;
        background-color: var(--color-white);
        color: var(--color-pink);
        box-shadow: var(--color-pink) 0px 0px 10px -2px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        font-size: 1rem;
        font-weight: bold;
        font-family: 'Oslo Sans', sans-serif;
        margin-top: 0.5rem;
    }

    button:hover {
        background-color: var(--color-pink);
        color: var(--color-white);
    }

    .error-message {
        background-color: #fef2f2;
        border: 2px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .success-message {
        background-color: #f0fdf4;
        border: 2px solid #86efac;
        color: #166534;
        padding: 1rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .resend-button {
        background-color: transparent;
        border: 2px solid #166534;
        color: #166534;
        padding: 8px 16px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        font-family: 'Oslo Sans', sans-serif;
        transition: background-color 0.3s, color 0.3s;
        margin-top: 0.5rem;
    }

    .resend-button:hover:not(:disabled) {
        background-color: #166534;
        color: white;
    }

    .resend-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .bottom-message {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1.5rem;
        text-align: center;
        font-size: 1rem;
        font-weight: 300;
        color: #333;
    }

    .bottom-message a {
        color: var(--color-pink);
        text-decoration: underline;
        font-weight: 500;
        margin-left: 0.25rem;
    }

    .bottom-message a:hover {
        color: #b82d4d;
    }

    .background-shapes {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
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

    @media (max-width: 570px) {
        .login {
            min-height: calc(100vh - 10vh);
            padding: 1rem;
        }

        .container {
            padding: 2rem 1.5rem;
        }

        .header h1 {
            font-size: 2rem;
        }

        .header p {
            font-size: 0.9rem;
        }

        .school-dropdown {
            max-height: 200px;
        }

        .shape-1 {
            width: 200px;
            height: 200px;
            top: -100px;
            left: -100px;
        }

        .shape-2 {
            width: 150px;
            height: 150px;
            right: -75px;
        }

        .shape-3 {
            width: 180px;
            height: 180px;
            bottom: -90px;
        }

        .shape-4 {
            width: 120px;
            height: 120px;
        }
    }
</style>

<svelte:window onclick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.school-selector')) {
        showSchoolDropdown = false;
    }
}} />