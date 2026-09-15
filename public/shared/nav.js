// nav.js
// Loads the shared nav bar (public/shared/nav.html) into any page that has a
// <div id="nav-placeholder"></div>, then highlights the link matching the
// current page so users can see where they are.

document.addEventListener('DOMContentLoaded', loadNav);

async function loadNav() {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  try {
    const res = await fetch('/shared/nav.html');

    if (!res.ok) {
      throw new Error(`Failed to load nav: ${res.status}`);
    }

    const html = await res.text();
    placeholder.innerHTML = html;
    highlightActiveLink();
  } catch (err) {
    // If the nav fails to load, we log it but don't throw — a page missing
    // its nav bar is a degraded experience, not a broken one. The rest of
    // the page should still function.
    console.error('Failed to load shared nav:', err);
  }
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach((link) => {
    // Compare the link's own path (not the full href string) against
    // where the browser currently is, so this works regardless of
    // domain/port.
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}