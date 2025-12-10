<svelte:head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
</svelte:head>

<footer>
    <div class="footer-container">
        <div class="attributors">
            <h3>Siden er laget av:</h3>
            <p>Elever fra vg3 IMST<br></p>
        </div>
        <div class="social-media">
            <h3>Kontakt Oss</h3>
            <div class="icons">
                <a href="https://facebook.com/elvebakkenvgs" target="_blank" aria-label="Facebook" class="facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://instagram.com/elvebakkenvgs" target="_blank" aria-label="Instagram" class="instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://tiktok.com/@elvebakkenvgs" target="_blank" aria-label="Tiktok" class="tiktok"><i class="fab fa-tiktok"></i></a>
            </div>
        </div>
        <div class="contact-info">
            <h3>Om Oss</h3>
            <p>Elvebakken VGS</p>
            <p>Vestre Elvebakke 3, 0182 Oslo</p>
            <p>Telefon: <a href="tel:23467300">234 67 300</a></p>
            <p>E-post: <a href="mailto:postmottak.elvebakken.vgs@osloskolen.no">postmottak.elvebakken.vgs@osloskolen.no</a></p>
            <p>Hjemmeside: <a href="https://elvebakken.vgs.no/">elvebakken.vgs.no</a></p>
        </div>
    </div>
    <div class="copy-right">
        <p>&copy; {new Date().getFullYear()} Elvebakken VGS. Alle rettigheter forbeholdt.</p>
        <p><a href="/personvernserklaering">Personvernserklæring</a></p>
    </div>
</footer>

<style>
    footer {
        background-color: var(--color-white);
        color: #212529;
        padding: 3rem 1rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        border-top: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .footer-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: wrap;
        flex-direction: row;
        gap: 2rem;
        width: 100%;
    }

    .social-media, .contact-info, .attributors {
        flex: 1;
        min-width: 250px;
        text-align: center;
    }

    h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        font-weight: 500;
    }

    .social-media .icons {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
    }

    .social-media a {
        font-size: 1.75rem;
        text-decoration: none;
        transition: transform 0.3s ease;
    }

    .social-media a:hover {
        transform: scale(1.1);
    }

    .social-media .facebook {
        color: #1877F2;
    }
    .social-media .instagram {
        background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: #E4405F; /* Fallback for browsers that don't support background-clip */
    }
    .social-media .tiktok {
        color: #000000;
    }

    .contact-info p {
        margin: 0.5rem 0;
        line-height: 1.6;
    }

    .contact-info a {
        color: #007bff;
        text-decoration: none;
    }

    .contact-info a:hover {
        text-decoration: underline;
    }

    .copy-right {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e9ecef;
        font-size: 0.9rem;
        color: #6c757d;
    }

    .copy-right a {
        color: #6c757d;
        text-decoration: none;
    }

    .copy-right a:hover {
        text-decoration: underline;
    }
</style>