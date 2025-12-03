<script lang="ts">
    let { data } = $props();
    const linje = data.linje;
</script>

<svelte:head>
    <title>{linje.tittel} - Åpen dag på Elvebakken</title>
    <meta name="description" content={linje.beskrivelse} />
    <meta name="keywords" content="{linje.tittel}, {linje.beskrivelse}, Åpen dag på Elvebakken, Elvebakken VGS, Elvebakken VGS Åpen dag, Åpen dag på Elvebakken, Åpendag VGS Oslo" />
</svelte:head>

<div class="container">
    <div class="hero-section">
        {#if linje.bilde}
            <img src={linje.bilde} alt={linje.tittel} class="hero-image" />
        {/if}
        <div class="hero-overlay" style="background: linear-gradient(to bottom, transparent, white);"></div>
        <h1 class="hero-title" style="color: {linje.farge};">{linje.tittel}</h1>
        <div class="scroll-indicator">
            <div class="scroll-arrow"></div>
        </div>
    </div>
    
    <div class="content">
        <div class="header-section">
            <p class="description">{linje.beskrivelse}</p>
        </div>
        
        <div class="text-section">
            {#if linje.langBeskrivelse}
                {@html linje.langBeskrivelse.split('\n\n').map((paragraph: string) => `<p class="paragraph">${paragraph}</p>`).join('')}
            {/if}
            {#if linje.eksternLenke}
                <a href={linje.eksternLenke} target="_blank">
                    <p class="paragraph">Les mer om {linje.tittel}</p>
                </a>
            {/if}
        </div>
    </div>
</div>

<style>
    .container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100vw;
        overflow-x: hidden;
    }

    .hero-section {
        margin-top: 10vh;
        position: relative;
        width: 100%;
        height: 90vh;
        max-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        overflow: hidden;
    }

    .hero-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        object-position: center 25%;
    }

    .hero-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20%;
        pointer-events: none;
    }

    .hero-title {
        position: absolute;
        top: 80%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        font-weight: 500;
        margin: 0;
        line-height: 1.2;
        text-align: center;
        z-index: 2;
        /* text-shadow: 
            0 0 10px rgba(0, 0, 0, 0.5),
            0 2px 4px rgba(0, 0, 0, 0.7),
            2px 2px 8px rgba(0, 0, 0, 0.5); */
        padding: 20px 40px;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        max-width: 90vw;
        word-wrap: break-word;
        overflow-wrap: break-word;
        box-sizing: border-box;
    }

    .scroll-indicator {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .scroll-arrow {
        width: 30px;
        height: 30px;
        border-right: 3px solid rgba(0, 0, 0, 0.6);
        border-bottom: 3px solid rgba(0, 0, 0, 0.6);
        transform: rotate(45deg);
        animation: scrollBounce 2s infinite;
    }

    @keyframes scrollBounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(45deg);
        }
        40% {
            transform: translateY(-10px) rotate(45deg);
        }
        60% {
            transform: translateY(-5px) rotate(45deg);
        }
    }

    .content {
        max-width: 900px;
        margin: 0 auto;
        padding: 60px 30px;
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .header-section {
        margin-bottom: 40px;
        text-align: center;
    }

    .description {
        font-size: 1.5rem;
        font-weight: 300;
        color: #666;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
    }

    .text-section {
        line-height: 1.8;
        font-size: 1.1rem;
        color: #333;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
    }

    .text-section :global(.paragraph) {
        margin: 0 0 24px 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
    }

    .text-section :global(.paragraph:last-child) {
        margin-bottom: 0;
    }

    @media (max-width: 1024px) {
        .hero-section {
            height: auto;
            max-height: none;
        }

        .hero-image {
            height: auto;
            object-fit: contain;
        }

        .scroll-indicator {
            display: none;
        }
    }

    @media (max-width: 768px) {
        .hero-title {
            font-size: 2.5rem;
        }

        .content {
            padding: 40px 20px;
        }

        .description {
            font-size: 1.2rem;
        }

        .text-section {
            font-size: 1rem;
        }
    }

    @media (max-width: 570px) {
        .hero-title {
            font-size: 1.75rem;
            padding: 0 15px;
        }

        .content {
            padding: 30px 15px;
        }

        .description {
            font-size: 1.1rem;
        }

        .text-section {
            font-size: 0.95rem;
            line-height: 1.6;
        }
    }
</style>
