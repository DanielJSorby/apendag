<script lang="ts">
    interface LinjeProps {
        linje: 'st' | 'kda' | 'mk' | 'im' | 'el' | 'stx';
        onclick?: () => void;
        linjeData?: any;
        showDescription?: boolean;
    }

    let { linje = 'st', onclick, linjeData, showDescription = true }: LinjeProps = $props();

    // Fallback data if not provided
    const defaultData = {
        st: { tittel: 'ST', farge: 'var(--color-blue)', lysfarge: 'var(--color-blue-light)' },
        kda: { tittel: 'KDA', farge: 'var(--color-green)', lysfarge: 'var(--color-green-light)' },
        mk: { tittel: 'MK', farge: 'var(--color-pink)', lysfarge: 'var(--color-pink-light)' },
        im: { tittel: 'IM', beskrivelse: 'IMST', farge: 'var(--color-blue)', lysfarge: 'var(--color-blue-light)' },
        el: { tittel: 'ED', beskrivelse: 'ELST', farge: 'var(--color-orange)', lysfarge: 'var(--color-orange-light)' }
    };

    const data = linjeData || defaultData;
    const currentLinje = data[linje];
</script>

<a href={`/linjer/${linje}`}>
<button class="linjeknapp" style="border-color: {currentLinje.farge}; color: {currentLinje.farge}; background-color: {currentLinje.lysfarge};" onclick={onclick}>
        <h1>{@html currentLinje.tittel}</h1>
        {#if currentLinje.beskrivelse && showDescription}
            <p>{currentLinje.beskrivelse}</p>
        {/if}
    </button>
</a>

<style>
    /* Desktop / Default størrelse */
    button.linjeknapp {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center; /* Center content vertically */
        width: 220px;
        min-height: 160px;
        border: 2px solid; /* Thinner border */
        border-radius: 20px; /* More rounded corners */
        cursor: pointer;
        transition: all 0.3s ease; /* Smoother transition */
        text-align: center;
        padding: 20px;
        overflow: hidden;
        box-sizing: border-box;
        position: relative; /* For absolute positioning of p */
    }

    button.linjeknapp h1 {
        font-size: 3rem; /* Larger font size */
        font-weight: 600; /* Slightly less bold */
        margin: 0;
        line-height: 1;
    }

    button.linjeknapp:hover {
        transform: translateY(-5px); /* Lift effect */
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    button.linjeknapp p {
        font-size: 0.9rem;
        margin: 0;
        opacity: 0.9;
        position: absolute;
        bottom: 15px;
        left: 0;
        right: 0;
        padding: 0 10px;
    }

     /* Mobil størrelse */
     @media (max-width: 570px) {
        button.linjeknapp {
            width: 42vw;
            min-height: 140px;
            padding: 15px 8px;
            border-radius: 15px;
        }

        button.linjeknapp h1 {
            font-size: 2.5rem;
        }

        button.linjeknapp p {
            font-size: 0.75rem;
            bottom: 10px;
        }
    }

    /* Tablet størrelse */
    @media (min-width: 571px) and (max-width: 1024px) {
        button.linjeknapp {
            width: 170px;
            min-height: 150px;
            padding: 14px 10px;
            gap: 8px;
        }
    }
</style>