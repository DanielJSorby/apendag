<script lang="ts">
    interface LinjeProps {
        linje: 'st' | 'kda' | 'mk' | 'im' | 'el' | 'stx';
        onclick?: () => void;
        linjeData?: any;
    }

    let { linje = 'st', onclick, linjeData }: LinjeProps = $props();

    // Fallback data if not provided
    const defaultData = {
        st: { tittel: 'Studiespesialisering', beskrivelse: 'Forberedelse til høyere utdanning', farge: 'var(--color-blue)', lysfarge: 'var(--color-blue-light)' },
        kda: { tittel: 'Kunst, design og arkitektur', beskrivelse: 'Kreativ utfoldelse og design', farge: 'var(--color-green)', lysfarge: 'var(--color-green-light)' },
        mk: { tittel: 'Medier og Kommunikasjon', beskrivelse: 'Film, foto og kommunikasjon', farge: 'var(--color-pink)', lysfarge: 'var(--color-pink-light)' },
        im: { tittel: 'Informasjonsteknologi og medieproduksjon', beskrivelse: 'Programmering og medieproduksjon', farge: 'var(--color-blue)', lysfarge: 'var(--color-blue-light)' },
        el: { tittel: 'Elektro og datateknologi', beskrivelse: 'Elektronikk og datasystemer', farge: 'var(--color-orange)', lysfarge: 'var(--color-orange-light)' }
    };

    const data = linjeData || defaultData;
    const currentLinje = data[linje];
</script>

<a href={`/linjer/${linje}`}>
<button class="linjeknapp" style="border-color: {currentLinje.farge}; color: {currentLinje.farge}; background-color: {currentLinje.lysfarge};" onclick={onclick}>
        <h1>{@html currentLinje.tittel}</h1>
        <p>{currentLinje.beskrivelse}</p>
    </button>
</a>

<style>
    /* Desktop / Default størrelse */
    button.linjeknapp {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 180px;
        min-height: 160px;
        border: 3px solid;
        border-radius: 15px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s, border-color 0.3s;
        text-align: center;
        padding: 15px 12px;
        overflow: hidden;
        box-sizing: border-box;
    }

    button.linjeknapp:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    button.linjeknapp h1 {
        font-size: 0.95rem;
        margin: 0;
        font-weight: bold;
        line-height: 1.2;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        flex-shrink: 0;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    button.linjeknapp p {
        font-size: 0.8rem;
        margin: 0;
        opacity: 0.8;
        line-height: 1.3;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

     /* Mobil størrelse */
     @media (max-width: 570px) {
        button.linjeknapp {
            width: 42vw;
            min-height: 140px;
            padding: 12px 8px;
            gap: 6px;
        }

        button.linjeknapp h1 {
            font-size: 0.85rem;
            line-height: 1.1;
        }

        button.linjeknapp p {
            font-size: 0.65rem;
            line-height: 1.2;
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

        button.linjeknapp h1 {
            font-size: 0.9rem;
            line-height: 1.15;
        }

        button.linjeknapp p {
            font-size: 0.75rem;
            line-height: 1.25;
        }
    }
</style>