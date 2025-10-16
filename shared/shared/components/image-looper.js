/**
 * Image Looper Component
 * Displays a set of images with previous/next navigation and zoom capability
 */

class ImageLooper extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.images = [];
    this.isZoomed = false;
  }

  connectedCallback() {
    // Get attributes
    const imagesAttr = this.getAttribute("images");
    const title = this.getAttribute("title") || "Images";

    if (imagesAttr) {
      this.images = imagesAttr.split(",").map((img) => img.trim());
    }

    this.render();
    this.attachEventListeners();
  }

  render() {
    const title = this.getAttribute("title") || "Images";

    this.innerHTML = `
            <div class="image-looper">
                <div class="looper-header">
                    <h3>${title}</h3>
                    <div class="looper-counter">
                        <span class="current-index">1</span> / <span class="total-images">${
                          this.images.length
                        }</span>
                    </div>
                </div>
                <div class="looper-image-container" data-zoomed="false">
                    <img src="${
                      this.images[0]
                    }" alt="${title} - Image 1" class="looper-image" title="Click to zoom">
                </div>
                <div class="looper-controls">
                    <button class="looper-btn prev-btn" ${
                      this.images.length <= 1 ? "disabled" : ""
                    }>
                        ← Previous
                    </button>
                    <button class="looper-btn zoom-btn">
                        🔍 Zoom
                    </button>
                    <button class="looper-btn next-btn" ${
                      this.images.length <= 1 ? "disabled" : ""
                    }>
                        Next →
                    </button>
                </div>
            </div>
        `;
  }

  attachEventListeners() {
    const prevBtn = this.querySelector(".prev-btn");
    const nextBtn = this.querySelector(".next-btn");
    const zoomBtn = this.querySelector(".zoom-btn");
    const img = this.querySelector(".looper-image");
    const container = this.querySelector(".looper-image-container");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousImage());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextImage());
    }

    if (zoomBtn) {
      zoomBtn.addEventListener("click", () => this.toggleZoom());
    }

    if (img) {
      img.addEventListener("click", () => this.toggleZoom());
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && !this.isZoomed) {
        this.previousImage();
      } else if (e.key === "ArrowRight" && !this.isZoomed) {
        this.nextImage();
      } else if (e.key === "Escape" && this.isZoomed) {
        this.toggleZoom();
      }
    });
  }

  toggleZoom() {
    const container = this.querySelector(".looper-image-container");
    const img = this.querySelector(".looper-image");
    const zoomBtn = this.querySelector(".zoom-btn");

    this.isZoomed = !this.isZoomed;

    if (this.isZoomed) {
      container.setAttribute("data-zoomed", "true");
      img.style.cursor = "zoom-out";
      img.title = "Click to zoom out (or press ESC)";
      zoomBtn.textContent = "↩️ Exit Zoom";
    } else {
      container.setAttribute("data-zoomed", "false");
      img.style.cursor = "zoom-in";
      img.title = "Click to zoom";
      zoomBtn.textContent = "🔍 Zoom";
    }
  }

  previousImage() {
    if (this.images.length <= 1) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  nextImage() {
    if (this.images.length <= 1) return;

    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  updateImage() {
    const img = this.querySelector(".looper-image");
    const currentIndexSpan = this.querySelector(".current-index");
    const title = this.getAttribute("title") || "Images";

    if (img) {
      img.src = this.images[this.currentIndex];
      img.alt = `${title} - Image ${this.currentIndex + 1}`;
    }

    if (currentIndexSpan) {
      currentIndexSpan.textContent = this.currentIndex + 1;
    }
  }
}

// Register the custom element
customElements.define("image-looper", ImageLooper);
