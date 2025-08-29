/* =========================
   Mobile menu
========================= */
function toggleMenu() {
  const menu = document.querySelector(".mobile-links");
  const icon = document.querySelector(".mobile-icon");
  if (!menu || !icon) return;
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}
window.toggleMenu = toggleMenu; // needed because HTML uses onclick="toggleMenu()"

/* =========================
   Project slideshow (single)
========================= */
let slideIndex = 0;
function showSlide(n) {
  const slides = document.querySelectorAll(".slideshow img");
  if (!slides.length) return;
  slideIndex = ((n % slides.length) + slides.length) % slides.length;
  slides.forEach((img, i) => img.classList.toggle("active", i === slideIndex));
}
function changeSlide(delta) {
  showSlide(slideIndex + delta);
}
window.changeSlide = changeSlide; // used by onclicks in HTML

/* =========================
   Contact form
========================= */
document.addEventListener("DOMContentLoaded", () => {
  showSlide(0);

  const form = document.getElementById("contact-form");
  const msg = document.getElementById("message");
  const counter = document.getElementById("msg-count");

  const fallback = document.getElementById("mail-fallback");
  const fallbackTo = document.getElementById("fallback-to");
  const fallbackBody = document.getElementById("fallback-body");
  const copyBtn = document.getElementById("copy-mail");
  const retryLink = document.getElementById("retry-mailto");

  let lastMailto = "";

  // ----- live character counter -----
  const updateCount = () => {
    if (msg && counter) counter.textContent = `${msg.value.length}/1000`;
  };
  if (msg) {
    msg.addEventListener("input", updateCount);
    updateCount();
  }

  // ----- tiny helper: show/hide per-field error text -----
  const validateField = (input) => {
    const field = input.closest(".field");
    const errorEl = field ? field.querySelector(".error") : null;
    let message = "";

    if (input.validity.valueMissing) {
      message = "This field is required.";
    } else if (input.type === "email" && input.validity.typeMismatch) {
      message = "Please enter a valid email address.";
    } else if (input.validity.tooShort) {
      message = `Minimum ${input.minLength} characters.`;
    } else if (input.validity.tooLong) {
      message = `Maximum ${input.maxLength} characters.`;
    }

    if (field && errorEl) {
      if (message) {
        field.classList.add("invalid");
        errorEl.textContent = message;
      } else {
        field.classList.remove("invalid");
        errorEl.textContent = "";
      }
    }
    return !message;
  };

  // validate on the fly
  if (form) {
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => validateField(el));
      el.addEventListener("blur", () => validateField(el));
    });
  }

  // ----- compose and open mailto; reveal fallback text -----
  function buildMailtoFrom(form) {
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const subject = (data.get("subject") || "").toString().trim();
    const message = (data.get("message") || "").toString();

    const body = `${message}\n\n— ${name}${email ? " <" + email + ">" : ""}`;

    const mailto =
      `mailto:veronikabassak@gmail.com` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    return { mailto, body };
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // run validation (both custom + native)
      let ok = true;
      form.querySelectorAll("input, textarea").forEach((el) => {
        if (!validateField(el)) ok = false;
      });
      if (!ok || !form.checkValidity()) {
        // show native bubbles if needed
        form.reportValidity();
        return;
      }

      const { mailto, body } = buildMailtoFrom(form);
      lastMailto = mailto;

      // Try to open default mail app
      window.location.href = mailto;

      // Fill + show fallback panel (cannot reliably detect failure)
      if (fallback && fallbackTo && fallbackBody) {
        fallbackTo.textContent = "veronikabassak@gmail.com";
        fallbackBody.value = body;
        fallback.hidden = false;
      }
    });

    // reset: clear errors, counter, hide fallback
    form.addEventListener("reset", () => {
      setTimeout(() => {
        form
          .querySelectorAll(".field")
          .forEach((f) => f.classList.remove("invalid"));
        if (fallback) fallback.hidden = true;
        updateCount();
      }, 0);
    });
  }

  // copy fallback text
  if (copyBtn && fallbackBody) {
    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(fallbackBody.value);
        } else {
          // older fallback
          fallbackBody.select();
          document.execCommand("copy");
        }
        alert("Copied to clipboard.");
      } catch {
        alert("Sorry, copy failed. Please select and copy manually.");
      }
    });
  }

  // retry opening the mail app with the same mailto
  if (retryLink) {
    retryLink.addEventListener("click", (e) => {
      if (!lastMailto) return; // nothing to retry yet
      e.preventDefault();
      window.location.href = lastMailto;
    });
  }
});
