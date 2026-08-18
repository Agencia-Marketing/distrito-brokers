/* Distrito Brokers — comportamiento compartido.
   Sin dependencias externas. Todo es mejora progresiva: sin JS el sitio
   sigue siendo navegable y el formulario conserva su estructura. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Navegación móvil
     --------------------------------------------------------------------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.getElementById("mobile-nav");

  if (toggle && panel) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.setAttribute("data-open", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Cerrar al elegir un destino o al pulsar Escape.
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si se vuelve a ancho de escritorio, el panel deja de tener sentido.
    var desktop = window.matchMedia("(min-width: 1024px)");
    var onChange = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------------------------------------------------------------------
     Apariciones suaves al hacer scroll
     --------------------------------------------------------------------- */
  var revealables = [].slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealAll = function () {
    document.documentElement.classList.remove("reveal-on-scroll");
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  };

  if (revealables.length && "IntersectionObserver" in window && !reduceMotion) {
    // Sólo ahora ocultamos: a partir de aquí el observador se hace responsable
    // de volver a mostrar cada bloque.
    document.documentElement.classList.add("reveal-on-scroll");

    var observerFired = false;
    var observer = new IntersectionObserver(
      function (entries) {
        observerFired = true;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });

    // Red de seguridad. IntersectionObserver siempre entrega una primera
    // llamada con el estado inicial de lo observado; si eso no ocurre, algo
    // impidió que el observador arrancara y mostramos todo de inmediato para
    // que el contenido no se quede invisible.
    window.setTimeout(function () {
      if (!observerFired) revealAll();
    }, 1200);
  } else {
    revealAll();
  }

  /* ---------------------------------------------------------------------
     Formulario de contacto → WhatsApp
     No hay backend: el formulario compone el mensaje y abre la conversación
     de WhatsApp con el texto listo para enviar. El usuario decide enviarlo.
     --------------------------------------------------------------------- */
  var form = document.querySelector("[data-wa-form]");

  if (form) {
    var status = form.querySelector("[data-form-status]");
    var number = form.getAttribute("data-wa-number") || "";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var value = function (name) {
        var raw = data.get(name);
        return raw ? String(raw).trim() : "";
      };

      var lines = ["Hola, me gustaría recibir información."];
      var add = function (label, name) {
        var v = value(name);
        if (v) lines.push(label + ": " + v);
      };

      add("Nombre", "nombre");
      add("WhatsApp / teléfono", "telefono");
      add("Qué busco", "interes");
      add("Crédito hipotecario", "credito");
      add("Mensaje", "mensaje");

      var href =
        "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));

      if (status) {
        status.textContent = "Abriendo WhatsApp con tu mensaje…";
      }

      window.open(href, "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     Vídeo de fondo
     Va en autoplay silenciado, pero quien pide menos movimiento no debería
     recibir un bucle de vídeo: se detiene y queda el poster.
     --------------------------------------------------------------------- */
  var fondoVideo = document.querySelector(".cta__bg video");

  if (fondoVideo && !reduceMotion) {
    // Son 2.6 MB para la última sección: no se descargan hasta que hace falta.
    var cargarVideo = function () {
      if (fondoVideo.src) return;
      fondoVideo.src = fondoVideo.getAttribute("data-src");
      var intento = fondoVideo.play();
      if (intento && intento.catch) intento.catch(function () {});
    };
    if ("IntersectionObserver" in window) {
      var ojo = new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          cargarVideo();
          obs.disconnect();
        });
      }, { rootMargin: "600px 0px" });
      ojo.observe(fondoVideo);
    } else {
      cargarVideo();
    }
  }

  /* ---------------------------------------------------------------------
     Slideshows automáticos
     Cada .slideshow apila varias imágenes y va alternando cuál lleva la clase
     .is-active. Sólo corren mientras están en pantalla: con trece fichas a la
     vez, animarlas todas de fondo gasta batería sin que nadie las vea.
     --------------------------------------------------------------------- */
  var slideshows = [].slice.call(document.querySelectorAll(".slideshow"));

  if (slideshows.length && !reduceMotion) {
    var INTERVALO = 4000;

    var arrancar = function (caja) {
      if (caja._temporizador) return;
      var fotos = caja.querySelectorAll("img");
      if (fotos.length < 2) return;
      // Arranque escalonado para que no cambien todas al unísono.
      var retraso = (caja._orden % 5) * 700;
      caja._inicio = window.setTimeout(function () {
        caja._temporizador = window.setInterval(function () {
          var actual = caja.querySelector("img.is-active") || fotos[0];
          var i = [].indexOf.call(fotos, actual);
          var siguiente = fotos[(i + 1) % fotos.length];
          // Se carga la siguiente antes de mostrarla para que no parpadee.
          if (siguiente.loading === "lazy") siguiente.loading = "eager";
          actual.classList.remove("is-active");
          siguiente.classList.add("is-active");
        }, INTERVALO);
      }, retraso);
    };

    var parar = function (caja) {
      window.clearTimeout(caja._inicio);
      window.clearInterval(caja._temporizador);
      caja._inicio = null;
      caja._temporizador = null;
    };

    slideshows.forEach(function (caja, i) {
      caja._orden = i;
      // Por si el observador no llegara a disparar, que al menos se vea una.
      if (!caja.querySelector("img.is-active")) {
        var primera = caja.querySelector("img");
        if (primera) primera.classList.add("is-active");
      }
    });

    if ("IntersectionObserver" in window) {
      var vigia = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (e) {
            if (e.isIntersecting) arrancar(e.target);
            else parar(e.target);
          });
        },
        { rootMargin: "120px 0px" }
      );
      slideshows.forEach(function (caja) {
        vigia.observe(caja);
      });
    } else {
      slideshows.forEach(arrancar);
    }

    // Al cambiar de pestaña no tiene sentido seguir animando.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) slideshows.forEach(parar);
    });
  }

  /* ---------------------------------------------------------------------
     Año en curso en el footer
     --------------------------------------------------------------------- */
  var years = document.querySelectorAll("[data-year]");
  if (years.length) {
    var year = String(new Date().getFullYear());
    years.forEach(function (el) {
      el.textContent = year;
    });
  }
})();
