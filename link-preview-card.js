/**
 * Copyright 2025 mikeyo4480
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `link-preview-card`
 *
 * @demo index.html
 * @element link-preview-card
 */
export class LinkPreviewCard extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "link-preview-card";
  }

  constructor() {
    super();
    this.title = "";
    this.webLink = "https://apple.com";
    this.description = "";
    this.imageLink = "";
    this.loading = false;

    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
    };
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/link-preview-card.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      webLink: { type: String, attribute: "web-link" },
      description: { type: String },
      imageLink: { type: String, attribute: "image-link" },
      loading: { type: Boolean },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          color: var(--ddd-primary-2);
          background-color: var(--ddd-theme-accent);
          font-family: var(--ddd-font-navigation);
        }
        .wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          margin: var(--ddd-spacing-2);
          padding: var(--ddd-spacing-4);
        }
        h3 span {
          font-size: var(
            --link-preview-card-label-font-size,
            var(--ddd-font-size-s)
          );
        }
        img {
          display: block;
          max-width: 400px;
          max-height: 400px;
          height: auto;
          margin: var(--ddd-spacing-2);
        }

        .link-search {
          margin-left: auto;
          margin-right: auto;
          display: block;
          text-align: center;
        }

        /* HTML: <div class="loader"></div> */
        /* HTML: <div class="loader"></div> */
        .loader {
          width: 50px;
          aspect-ratio: 1;
          display: grid;
          -webkit-mask: conic-gradient(from 15deg, #0000, #000);
          mask: conic-gradient(from 15deg, #0000, #000);
          animation: l26 1s infinite steps(12);
        }
        .loader,
        .loader:before,
        .loader:after {
          background: radial-gradient(
                closest-side at 50% 12.5%,
                #f03355 96%,
                #0000
              )
              50% 0/20% 80% repeat-y,
            radial-gradient(closest-side at 12.5% 50%, #f03355 96%, #0000) 0 50%/80%
              20% repeat-x;
        }
        .loader:before,
        .loader:after {
          content: "";
          grid-area: 1/1;
          transform: rotate(30deg);
        }
        .loader:after {
          transform: rotate(60deg);
        }

        @keyframes l26 {
          100% {
            transform: rotate(1turn);
          }
        }
      `,
    ];
  }

  // Lit render the HTML
  render() {
    return html` <div class="wrapper">
      <div class="link-search">
        <input id="input" placeholder="Search" @keydown=${this.inputChanged} />
        <button id="search" @click="${this.inputChanged}">Search</button>
      </div>
      ${this.loading
        ? html`<div class="loader"></div>` // Show loader when loading is true
        : html`
            <p>
              <a href="${this.webLink}" target="_blank">${this.webLink}</a>
            </p>
            <h3>${this.title}</h3>
            <p>${this.description}</p>
            <img
              id="myimage"
              src="${this.imageLink}"
              alt="${this.t.title}: ${this.title}"
              loading="lazy"
              width="100%"
            />
          `}
      <slot></slot>
    </div>`;
  }

  inputChanged(e) {
    // const input = document.getElementById("input");
    // const searchButton = document.getElementById("search");
    // const searchCard = document.getElementById("search-card");

    if (
      (e.type == "click" || e.key == "Enter") &&
      !/https:/.test(this.shadowRoot.querySelector("#input").value.trim())
    ) {
      alert("Please enter a valid URL starting with https:."); // If empty, error
    } else if (e.type == "click" || e.key == "Enter") {
      this.webLink = this.shadowRoot.querySelector("#input").value.trim();
      this.loading = true;
      // Update the web-link attribute
    }
  }

  updated(changedProperties) {
    if (changedProperties.has("webLink")) {
      this.updateResults();
    }
    setTimeout(() => {
      console.log("Delayed for 5 seconds.");
      this.loading = false;
    }, 5000);
  }

  // https://corsproxy.io/?url=
  updateResults(value) {
    fetch(
      `https://open-apis.hax.cloud/api/services/website/metadata?q=${this.webLink}`
    )
      .then((d) => (d.ok ? d.json() : {}))
      .then((response) => {
        if (response.data["og:title"]) {
          this.title = response.data["og:title"];
        } else if (response.data.title) {
          this.title = response.data.title;
        } else {
          this.title = "Error: No title found";
        }

        if (response.data["og:description"]) {
          this.description = response.data["og:description"];
        } else if (response.data["description"]) {
          this.description = response.data["description"];
        } else {
          this.description = "Error: No description found";
        }

        if (response.data["og:image"]) {
          this.imageLink = response.data["og:image"];
        } else if (response.data["ld+json"].logo) {
          this.imageLink = response.data["ld+json"].logo;
        } else if (response.data["og:title"]) {
          this.imageLink = response.data["ld+json"]["publisher"].logo;
        } else {
          this.imageLink = "jfjfjfjdj";
          this.webLink = this.shadowRoot
            .querySelector("#myimage")
            .removeAttribute("src");
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(LinkPreviewCard.tag, LinkPreviewCard);
