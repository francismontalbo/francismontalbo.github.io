// Initialize AOS animations
      AOS.init({ once: true });

      // Mobile navigation toggle
      const navToggle = document.getElementById('nav-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });

      // Back to top button
      const backToTopBtn = document.getElementById('backToTop');
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.remove('hidden');
        } else {
          backToTopBtn.classList.add('hidden');
        }
      });
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Set current year in footer
      document.getElementById('year').textContent = new Date().getFullYear();

      // Tab switching logic for works section
      const tabs = document.querySelectorAll('.tab');
      const tabContents = document.querySelectorAll('.tab-content');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active state from all tabs and hide all contents
          tabs.forEach(t => t.classList.remove('bg-tertiary'));
          tabContents.forEach(c => c.classList.add('hidden'));
          // Add active state to clicked tab and show corresponding content
          tab.classList.add('bg-tertiary');
          const target = tab.getAttribute('data-target');
          document.getElementById(target).classList.remove('hidden');
        });
      });

      // Contact form mailto composer
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const name = document.getElementById('contact-name')?.value.trim();
          const email = document.getElementById('contact-email')?.value.trim();
          const subject = document.getElementById('contact-subject')?.value.trim();
          const message = document.getElementById('contact-message')?.value.trim();
          const destination = contactForm.querySelector('input[name="contact-destination"]:checked')?.value || 'francismontalbo@ieee.org';
          const bodyText = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
          window.location.href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        });
      }

      // Fallback chatbot toggle wiring (kept minimal so widget can always open even if external script errors)
      const chatbotFab = document.getElementById('chatbot-fab');
      const chatbotWidget = document.getElementById('chatbot-widget');
      const chatbotClose = document.getElementById('chatbot-close');
      let chatbotIdleTimer;
      const setChatbotActive = (el) => {
        if (!el) return;
        el.classList.remove('chatbot-idle');
        el.classList.add('chatbot-active');
      };
      const setChatbotIdle = (el) => {
        if (!el) return;
        el.classList.remove('chatbot-active');
        el.classList.add('chatbot-idle');
      };
      const resetIdleTimer = (el) => {
        clearTimeout(chatbotIdleTimer);
        setChatbotActive(el);
        chatbotIdleTimer = setTimeout(() => setChatbotIdle(el), 4000);
      };
      const makeDraggable = (el, handle) => {
        if (!el || !handle) return;
        let isDragging = false;
        let hasMoved = false;
        let startX = 0;
        let startY = 0;
        let baseLeft = 0;
        let baseTop = 0;
        const onMove = (event) => {
          if (!isDragging) return;
          const x = event.clientX ?? event.touches?.[0]?.clientX;
          const y = event.clientY ?? event.touches?.[0]?.clientY;
          if (x == null || y == null) return;
          const nextLeft = Math.min(window.innerWidth - el.offsetWidth - 8, Math.max(8, baseLeft + (x - startX)));
          const nextTop = Math.min(window.innerHeight - el.offsetHeight - 8, Math.max(8, baseTop + (y - startY)));
          if (Math.abs(x - startX) > 6 || Math.abs(y - startY) > 6) hasMoved = true;
          el.style.left = `${nextLeft}px`;
          el.style.top = `${nextTop}px`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        };
        const onEnd = () => {
          isDragging = false;
          if (hasMoved) {
            el.dataset.draggingRecent = '1';
            setTimeout(() => { delete el.dataset.draggingRecent; }, 700);
          }
          el.classList.remove('is-dragging');
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onEnd);
          window.removeEventListener('touchmove', onMove);
          window.removeEventListener('touchend', onEnd);
        };
        const onStart = (event) => {
          isDragging = true;
          hasMoved = false;
          event.preventDefault();
          el.classList.add('is-dragging');
          const x = event.clientX ?? event.touches?.[0]?.clientX;
          const y = event.clientY ?? event.touches?.[0]?.clientY;
          startX = x || 0;
          startY = y || 0;
          const rect = el.getBoundingClientRect();
          baseLeft = rect.left;
          baseTop = rect.top;
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onEnd);
          window.addEventListener('touchmove', onMove, { passive: true });
          window.addEventListener('touchend', onEnd);
        };
        handle.addEventListener('mousedown', onStart);
        handle.addEventListener('touchstart', onStart, { passive: true });
      };
      if (chatbotFab && chatbotWidget) {
        const widgetHandle = chatbotWidget.querySelector('.chatbot-drag-handle');
        makeDraggable(chatbotWidget, widgetHandle);
        makeDraggable(chatbotFab, chatbotFab);
        resetIdleTimer(chatbotFab);
        const openWidget = () => {
          if (chatbotFab.dataset.draggingRecent) return;
          chatbotWidget.classList.remove('hidden');
          chatbotWidget.style.display = 'block';
          chatbotFab.classList.add('hidden');
          resetIdleTimer(chatbotWidget);
        };
        const closeWidget = () => {
          chatbotWidget.classList.add('hidden');
          chatbotWidget.style.display = '';
          chatbotFab.classList.remove('hidden');
          resetIdleTimer(chatbotFab);
        };
        chatbotFab.addEventListener('click', openWidget);
        if (chatbotClose) chatbotClose.addEventListener('click', closeWidget);
        ['mouseenter', 'focusin', 'pointerdown'].forEach((evt) => {
          chatbotWidget.addEventListener(evt, () => resetIdleTimer(chatbotWidget), { passive: true });
          chatbotFab.addEventListener(evt, () => resetIdleTimer(chatbotFab), { passive: true });
        });
      }

      // Fallback message handler (guarantees basic replies if external chatbot script fails to bind)
      const chatbotMessages = document.getElementById('chatbot-messages');
      const chatbotInput = document.getElementById('chatbot-input');
      const chatbotSend = document.getElementById('chatbot-send');
      if (chatbotMessages && chatbotInput && chatbotSend && !chatbotSend.dataset.boundFallback) {
        const addFallbackBubble = (text, role = 'assistant') => {
          const row = document.createElement('div');
          row.className = `flex items-start gap-2 ${role === 'user' ? 'justify-end' : ''}`;
          row.innerHTML = role === 'user'
            ? `<div class="w-8 h-8 rounded-full bg-accent2 text-primaryDark flex items-center justify-center font-bold order-2">You</div><div class="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-accent2 text-primaryDark shadow">${text}</div>`
            : `<div class="w-8 h-8 rounded-full bg-accent text-primaryDark flex items-center justify-center font-bold">AI</div><div class="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-tertiary text-gray-100 shadow">${text}</div>`;
          chatbotMessages.appendChild(row);
          chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };
        const fallbackAnswer = (q) => {
          const query = q.toLowerCase();
          if (query.includes('contact') || query.includes('email')) return 'Contact Dr. Francis Jesmar P. Montalbo at francismontalbo@ieee.org or francisjesmar.montalbo@g.batstate-u.edu.ph.';
          if (query.includes('scholar') || query.includes('scopus') || query.includes('h-index')) return 'Profiles: Google Scholar (user=PV8dJDkAAAAJ) and Scopus (authorId=57221928564).';
          return 'Thanks for your question. The assistant is in fallback mode right now; please try again in a few seconds for full live responses.';
        };
        const sendFallbackMessage = () => {
          const q = chatbotInput.value.trim();
          if (!q) return;
          addFallbackBubble(q, 'user');
          chatbotInput.value = '';
          addFallbackBubble(fallbackAnswer(q), 'assistant');
        };
        chatbotSend.addEventListener('click', sendFallbackMessage);
        chatbotInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') sendFallbackMessage();
        });
        chatbotSend.dataset.boundFallback = '1';
      }
