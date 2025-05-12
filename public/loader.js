/* public/loader.js  –  v1.2  */
(() => {
  if (window.VirageChat) return; // avoid double–load

  const SCRIPT = document.currentScript;
  const ORG = SCRIPT?.dataset.org || "";
  const COLOR = SCRIPT?.dataset.primary || "#0000";

  // Create the floating button
  const btn = document.createElement("div");
  btn.id = "virage-chat-btn";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "2147483646",
    boxShadow: "0 2px 8px rgba(0,0,0,.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease", // <-- add transition
  });

  // Use an <img> icon instead of text
  const iconUrl =
    SCRIPT?.dataset.icon ||
    SCRIPT.src.replace(/\/loader\.js.*$/, "") + "/ai.svg";
  const img = document.createElement("img");
  img.src = iconUrl;
  img.alt = "Chat";
  img.style.width = "30px";
  img.style.height = "30px";
  btn.appendChild(img);

  // Hover animations
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.1)";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  });

  document.body.appendChild(btn);

  // Create the hidden iframe
  const iframe = document.createElement("iframe");
  iframe.id = "virage-chat-iframe";
  iframe.src = `${SCRIPT.src.replace(/\/loader\.js.*$/, "")}/embed?org=${ORG}`;
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "80px",
    right: "24px",
    width: "0",
    height: "0",
    border: "none",
    borderRadius: "16px",
    overflow: "hidden",
    transition: "width .25s ease, height .25s ease",
    zIndex: "2147483646",
  });
  document.body.appendChild(iframe);

  let open = false;
  btn.addEventListener("click", () => {
    open = !open;
    if (open) {
      iframe.style.width = "320px";
      iframe.style.height = "480px";
    } else {
      iframe.style.width = "0";
      iframe.style.height = "0";
    }
  });

  window.VirageChat = { toggle: () => btn.click() };
})();
