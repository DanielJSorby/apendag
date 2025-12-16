<div class="noemer-section">
    <div class="content-wrapper">
        <h2 class="heading">Noe mer...</h2>
        <div class="text-content">
            <p class="paragraph">
                Elevbakken skal være noe mer enn en vanlig skole. Vi har derfor mange arenaer elever kan delta på. Tillit, fleksibilitet, ansvarlighet og samarbeid er stikkord som vises gjennom vår studietidsmodell, studiefrokost- og suppe, skriverkurs, lørdagsskole med mer.
            </p>
            <p class="paragraph">
                Elvebakkenrevyen, Badelaget, Bakkasjakka, Elvebakken Laget, de andre elevlagene og oppstartsprogrammet på Lunde er blitt til opplevelser som bygger en spesiell Bakkakultur.
            </p>
            <a href="/noe-mer" class="les-mer-knapp styled-btn">Les mer</a>
        </div>
    </div>
</div>

<style>
    .noemer-section {
        width: 100%;
        max-width: 100vw;
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        background-color: var(--color-grey);
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .content-wrapper {
        max-width: 1200px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        box-sizing: border-box;
    }

    .heading {
        font-size: 3rem;
        font-weight: 500;
        color: var(--color-pink);
        margin: 0;
        text-align: left;
    }

    .text-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .paragraph {
        font-size: 1.25rem;
        line-height: 1.8;
        color: var(--color-black);
        margin: 0;
        text-align: left;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .les-mer-knapp {
        display: inline-block;
        margin-top: 0.5rem;
        text-decoration: none;
        align-self: flex-start;
    }

    .styled-btn {
        padding: 0.875rem 2rem;
        border: 2px solid var(--color-pink);
        border-radius: 12px;
        background-color: var(--color-white);
        color: var(--color-pink);
        font-size: 1.1rem;
        font-weight: 500;
        font-family: 'Oslo Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--color-pink) 0px 0px 15px -3px;
        display: inline-block;
        text-decoration: none;
    }

    .styled-btn:hover {
        background-color: var(--color-pink);
        color: var(--color-white);
        box-shadow: var(--color-pink) 0px 0px 20px -2px;
        transform: translateY(-2px);
    }

    .styled-btn:active {
        transform: translateY(0);
    }

    /* Tablet styles */
    @media (max-width: 1024px) {
        .noemer-section {
            padding: 3rem 2rem;
        }

        .heading {
            font-size: 2.5rem;
        }

        .paragraph {
            font-size: 1.15rem;
        }
    }

    /* Mobile styles */
    @media (max-width: 570px) {
        .noemer-section {
            min-height: auto;
            padding: 2rem 1.5rem;
        }

        .content-wrapper {
            gap: 1.5rem;
        }

        .heading {
            font-size: 2rem;
        }

        .paragraph {
            font-size: 1rem;
            line-height: 1.6;
        }

        .styled-btn {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
        }
    }
</style>
