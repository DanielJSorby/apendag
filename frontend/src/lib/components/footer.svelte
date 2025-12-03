<svelte:head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
</svelte:head>

<footer>
    <div class="footer-container">
        <div class="social-media">
            <h3>Følg oss</h3>
            <div class="icons">
                <a href="https://facebook.com/elvebakkenvgs" target="_blank" aria-label="Facebook" class="facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="https://instagram.com/elvebakkenvgs" target="_blank" aria-label="Instagram" class="instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://tiktok.com/elvebakkenvgs" target="_blank" aria-label="Tiktok" class="tiktok"><i class="fab fa-tiktok"></i></a>
            </div>
        </div>
        <div class="contact-info">
            <h3>Kontakt oss</h3>
            <p>Elvebakken VGS</p>
            <p>Vestre Elvebakke 3, 0182 Oslo</p>
            <p>Telefon: <a href="tel:22996600">22 99 66 00</a></p>
            <p>E-post: <a href="mailto:post@elvebakken.vgs.no">post@elvebakken.vgs.no</a></p>
        </div>
    </div>
    <div class="copy-right">
        <p>&copy; {new Date().getFullYear()} Elvebakken VGS. Alle rettigheter forbeholdt.</p>
    </div>
</footer>

<style>
    footer {
        background-color: var(--color-grey);
        color: #212529;
        padding: 3rem 1rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        border-top: 1px solid #e9ecef;
    }

    .footer-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        max-width: 800px;
        margin: 0 auto 2rem auto;
        gap: 2rem;
    }

    .social-media, .contact-info {
        flex: 1;
        min-width: 250px;
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
</style>