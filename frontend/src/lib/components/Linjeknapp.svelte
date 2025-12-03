<script lang="ts">
    interface LinjeProps {
        linje: 'st' | 'kda' | 'mk' | 'im' | 'el';
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
    button.linjeknapp {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 15vw;
        height: 15vh;
        border: 4px solid;
        border-radius: 15px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s, border-color 0.3s;
        text-align: center;
        padding: 15px;
        overflow: hidden;
    }

    button.linjeknapp:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    button.linjeknapp h1 {
        font-size: 1.1rem;
        margin: 0 0 10px 0;
        font-weight: bold;
        justify-self: flex-start;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    button.linjeknapp p {
        font-size: 0.85rem;
        margin: 0;
        opacity: 0.8;
        justify-self: flex-end;
    }

     @media (max-width: 570px) {
        button.linjeknapp {
            width: 40vw;
            height: 20vh;
            padding: 10px;
        }

        button.linjeknapp h1 {
            font-size: 1rem;
        }

        button.linjeknapp p {
            font-size: 0.75rem;
        }
    }
</style>