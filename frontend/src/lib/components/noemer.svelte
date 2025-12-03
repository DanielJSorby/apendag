<div class="noemer-section">
    <div class="content-wrapper">
        <h2 class="heading">Noe mer...</h2>
        <div class="text-content">
            <p class="paragraph">
                Elevbakken skal være noe mer enn en vanlig skole. Vi har derfor mange arenaer elever kan delta på. Tillit, fleksibilitet, ansvarlighet og samarbeid er stikkord som vises gjennom vår studietidsmodell, studiefrokost- og suppe, skriverkurs, lørdagsskole med mer.
            </p>
            <p class="paragraph">
                Elvebakkenrevyen og oppstartsprogrammet på Lunde er blitt til opplevelser som bygger en spesiell Bakkakultur.
            </p>
        </div>
    </div>
</div>

<style>
    .noemer-section {
        width: 100%;
        min-height: 50vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        background-color: var(--color-white);
    }

    .content-wrapper {
        max-width: 1200px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
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
    }
</style>
