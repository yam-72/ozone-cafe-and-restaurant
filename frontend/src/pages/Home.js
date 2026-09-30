import { Link } from "react-router-dom";

import "../styles/Home.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=85";

function Home() {
  return (
    <main className="home-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="home-navbar">
  <div className="home-navbar__inner">

    {/* OZONE Logo */}
    <Link to="/" className="home-navbar__brand">
      <span className="home-navbar__logo">☕</span>

      <div className="home-navbar__brand-text">
        <strong>OZONE</strong>
        <small>CAFE & RESTAURANT</small>
      </div>
    </Link>

    {/* Authentication - Top Right */}
    <div className="home-navbar__actions">

      <Link
        to="/login"
        className="home-navbar__signin"
      >
        Sign In
      </Link>

      <Link
        to="/register"
        className="home-navbar__signup"
      >
        Sign Up
      </Link>

    </div>

  </div>
</header>

      {/* =====================================================
          LANDING / HERO
      ====================================================== */}

      <section
        id="home"
        className="home-hero"
        style={{
          "--hero-image": `url(${HERO_IMAGE})`,
        }}
      >

        <div className="home-hero__image"></div>

        <div className="home-hero__overlay"></div>

        <div className="home-hero__content">

          <span className="home-eyebrow">
            WELCOME TO OZONE
          </span>

          <h1>
            Taste the
            <br />
            <span>Moment.</span>
          </h1>

          <p>
            A place where exceptional coffee,
            delicious food, and unforgettable
            moments come together.
          </p>

          <div className="home-hero__buttons">

            <a
              href="#footer"
              className="home-button home-button--primary"
            >
              Discover OZONE
              <span>↓</span>
            </a>

            <Link
              to="/register"
              className="home-button home-button--outline"
            >
              Create Account
              <span>→</span>
            </Link>

          </div>

        </div>


        {/* Hero Details */}

        <div className="home-hero__bottom">

          <div className="home-hero__detail">
            <span>01</span>
            <small>CAFE</small>
          </div>

          <div className="home-hero__detail">
            <span>02</span>
            <small>RESTAURANT</small>
          </div>

          <div className="home-hero__detail">
            <span>03</span>
            <small>EXPERIENCE</small>
          </div>

        </div>


        {/* Scroll indicator */}

        <a
          href="#footer"
          className="home-scroll"
          aria-label="Scroll down"
        >
          <span></span>
        </a>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        id="footer"
        className="home-footer"
      >

        {/* Decorative line */}

        <div className="home-footer__line"></div>


        <div className="home-footer__main">

          {/* Brand */}

          <div className="home-footer__brand">

            <Link
              to="/"
              className="home-footer__logo"
            >
              <span>☕</span>

              <div>
                <strong>OZONE</strong>
                <small>CAFE & RESTAURANT</small>
              </div>
            </Link>

            <p>
              Good food.
              <br />
              Great coffee.
              <br />
              Beautiful moments.
            </p>

          </div>


          {/* Explore */}

          <div className="home-footer__column">

            <h4>EXPLORE</h4>

            <a href="#home">
              Home
            </a>

            <Link to="/login">
              Sign In
            </Link>

            <Link to="/register">
              Sign Up
            </Link>

          </div>


          {/* Contact */}

          <div className="home-footer__column">

            <h4>VISIT US</h4>

            <p>
            Bahirdar
            </p>

            <p>
              Ethiopia
            </p>

            <p>
              Open Daily
            </p>

          </div>


          {/* Social */}

          <div className="home-footer__column">

            <h4>CONNECT</h4>

            <a
              href="#footer"
              onClick={(event) => event.preventDefault()}
            >
              Instagram
            </a>

            <a
              href="#footer"
              onClick={(event) => event.preventDefault()}
            >
              Facebook
            </a>

            <a
              href="#footer"
              onClick={(event) => event.preventDefault()}
            >
              Contact Us
            </a>

          </div>

        </div>


        {/* Footer Quote */}

        <div className="home-footer__quote">

          <span>“</span>

          <p>
            Come for the coffee.
            <br />
            Stay for the moment.
          </p>

          <span>”</span>

        </div>


        {/* Bottom */}

        <div className="home-footer__bottom">

          <p>
            © {new Date().getFullYear()} OZONE Cafe & Restaurant
          </p>

          <span>
            Bahirdar · Ethiopia
          </span>

          <span>
            Crafted with care.
          </span>

        </div>

      </footer>

    </main>
  );
}

export default Home;