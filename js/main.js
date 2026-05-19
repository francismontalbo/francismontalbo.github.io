// Initialize AOS animations when the CDN script is available.
      if (typeof AOS !== 'undefined') {
        AOS.init({
          once: true,
          disable: () => window.innerWidth < 768
        });
      }

      // Mobile navigation toggle
      const navToggle = document.getElementById('nav-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      if (navToggle && mobileMenu) {
        let menuCloseTimer = null;
        let menuOpenFrame = null;
        const isMobileMenuOpen = () => navToggle.getAttribute('aria-expanded') === 'true';
        const openMobileMenu = () => {
          window.clearTimeout(menuCloseTimer);
          if (menuOpenFrame) window.cancelAnimationFrame(menuOpenFrame);
          mobileMenu.classList.remove('hidden');
          navToggle.setAttribute('aria-expanded', 'true');
          mobileMenu.setAttribute('aria-hidden', 'false');
          menuOpenFrame = window.requestAnimationFrame(() => {
            mobileMenu.classList.add('is-open');
            menuOpenFrame = null;
          });
        };
        const closeMobileMenu = ({ immediate = false, focusToggle = false } = {}) => {
          window.clearTimeout(menuCloseTimer);
          if (menuOpenFrame) {
            window.cancelAnimationFrame(menuOpenFrame);
            menuOpenFrame = null;
          }
          navToggle.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('is-open');
          mobileMenu.setAttribute('aria-hidden', 'true');

          const hideMenu = () => mobileMenu.classList.add('hidden');
          if (immediate) {
            hideMenu();
          } else {
            menuCloseTimer = window.setTimeout(hideMenu, 420);
          }

          if (focusToggle) navToggle.focus();
        };
        navToggle.addEventListener('click', () => {
          if (isMobileMenuOpen()) {
            closeMobileMenu();
          } else {
            openMobileMenu();
          }
        });
        mobileMenu.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => closeMobileMenu());
        });
        document.addEventListener('click', (event) => {
          if (!isMobileMenuOpen()) return;
          if (mobileMenu.contains(event.target) || navToggle.contains(event.target)) return;
          closeMobileMenu();
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && isMobileMenuOpen()) {
            closeMobileMenu({ focusToggle: true });
          }
        });
        window.addEventListener('resize', () => {
          if (window.innerWidth >= 1024) closeMobileMenu({ immediate: true });
        }, { passive: true });
      }

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

      // Background music controls
      const bgmControl = document.getElementById('bgm-control');
      const bgmAudio = document.getElementById('bgm-audio');
      const bgmShell = document.getElementById('bgm-shell');
      const bgmPanel = bgmControl?.querySelector('.bgm-panel');
      const bgmPlayToggle = document.getElementById('bgm-play-toggle');
      const bgmMuteToggle = document.getElementById('bgm-mute-toggle');
      const bgmVolume = document.getElementById('bgm-volume');
      if (bgmControl && bgmAudio && bgmShell && bgmPanel && bgmPlayToggle && bgmMuteToggle && bgmVolume) {
        const defaultVolume = 0.18;
        const collapseDelay = 5200;
        let collapseTimer = null;
        let userPausedBgm = false;
        const getPreference = (key) => {
          try {
            return window.localStorage.getItem(key);
          } catch {
            return null;
          }
        };
        const setPreference = (key, value) => {
          try {
            window.localStorage.setItem(key, value);
          } catch {
            // Ignore storage restrictions; controls still work for the current visit.
          }
        };
        const clampVolume = (value) => Math.min(1, Math.max(0, Number.parseFloat(value) || 0));
        const storedVolume = getPreference('francis-bgm-volume');
        const savedVolume = storedVolume == null ? defaultVolume : clampVolume(storedVolume);
        const storedMuted = getPreference('francis-bgm-muted');
        const hasStoredMutePreference = storedMuted != null;
        const savedMuted = hasStoredMutePreference ? storedMuted === 'true' : false;

        bgmAudio.volume = savedVolume;
        bgmAudio.muted = savedMuted;
        bgmVolume.value = String(bgmAudio.volume);

        const syncMutedAttribute = () => {
          bgmAudio.defaultMuted = bgmAudio.muted;
          if (bgmAudio.muted) {
            bgmAudio.setAttribute('muted', '');
          } else {
            bgmAudio.removeAttribute('muted');
          }
        };
        syncMutedAttribute();
        if (bgmAudio.dataset.src && !bgmAudio.currentSrc) {
          bgmAudio.src = bgmAudio.dataset.src;
          bgmAudio.load();
        }

        const setIcon = (button, iconName) => {
          const icon = button.querySelector('i');
          if (!icon) return;
          icon.className = `fa-solid ${iconName}`;
        };

        const setBgmExpanded = (expanded) => {
          bgmControl.dataset.expanded = String(expanded);
          bgmShell.setAttribute('aria-expanded', String(expanded));
          bgmShell.setAttribute('aria-label', expanded ? 'Close background music controls' : 'Open background music controls');
          bgmShell.setAttribute('title', expanded ? 'Close background music controls' : 'Open background music controls');
          bgmPanel.setAttribute('aria-hidden', String(!expanded));
        };

        const resetBgmCollapseTimer = () => {
          window.clearTimeout(collapseTimer);
          setBgmExpanded(true);
          collapseTimer = window.setTimeout(() => {
            if (!bgmControl.matches(':focus-within')) setBgmExpanded(false);
          }, collapseDelay);
        };

        const updateBgmState = (forcedState) => {
          const state = forcedState
            || (bgmAudio.error ? 'unavailable' : bgmAudio.paused ? 'paused' : (bgmAudio.muted || bgmAudio.volume === 0 ? 'muted' : 'playing'));
          bgmControl.dataset.audioState = state;

          const playLabel = state === 'unavailable'
            ? 'Background music unavailable'
            : !bgmAudio.paused
              ? 'Pause background music'
              : 'Play background music';
          const muteLabel = state === 'unavailable'
            ? 'Background music unavailable'
            : (bgmAudio.muted || bgmAudio.volume === 0)
              ? 'Unmute background music'
              : 'Mute background music';

          bgmPlayToggle.setAttribute('aria-label', playLabel);
          bgmPlayToggle.setAttribute('title', playLabel);
          bgmPlayToggle.setAttribute('aria-pressed', String(!bgmAudio.paused));
          bgmMuteToggle.setAttribute('aria-label', muteLabel);
          bgmMuteToggle.setAttribute('title', muteLabel);
          bgmMuteToggle.setAttribute('aria-pressed', String(bgmAudio.muted || bgmAudio.volume === 0));

          setIcon(bgmPlayToggle, !bgmAudio.paused && state !== 'unavailable' ? 'fa-pause' : 'fa-play');
          if (state === 'unavailable' || bgmAudio.muted || bgmAudio.volume === 0) setIcon(bgmMuteToggle, 'fa-volume-xmark');
          else if (bgmAudio.volume < 0.45) setIcon(bgmMuteToggle, 'fa-volume-low');
          else setIcon(bgmMuteToggle, 'fa-volume-high');
        };

        const attemptBgmPlay = ({ mutedFallback = true } = {}) => {
          if (bgmAudio.error) {
            updateBgmState('unavailable');
            return Promise.resolve(false);
          }
          syncMutedAttribute();
          const playAttempt = bgmAudio.play();
          if (!playAttempt || typeof playAttempt.then !== 'function') {
            updateBgmState();
            return Promise.resolve(true);
          }
          return playAttempt
            .then(() => {
              updateBgmState();
              return true;
            })
            .catch(() => {
              if (mutedFallback && !bgmAudio.muted) {
                bgmAudio.muted = true;
                syncMutedAttribute();
                const mutedPlayAttempt = bgmAudio.play();
                if (mutedPlayAttempt && typeof mutedPlayAttempt.then === 'function') {
                  return mutedPlayAttempt
                    .then(() => {
                      updateBgmState();
                      return true;
                    })
                    .catch(() => {
                      updateBgmState('blocked');
                      return false;
                    });
                }
              }
              updateBgmState('blocked');
              return false;
            });
        };

        const setBgmVolume = (value) => {
          const nextVolume = clampVolume(value);
          bgmAudio.volume = nextVolume;
          bgmVolume.value = String(nextVolume);
          setPreference('francis-bgm-volume', String(nextVolume));
          if (nextVolume === 0) {
            bgmAudio.muted = true;
            setPreference('francis-bgm-muted', 'true');
          } else {
            bgmAudio.muted = false;
            setPreference('francis-bgm-muted', 'false');
          }
          syncMutedAttribute();
          updateBgmState();
        };

        const startBgmFromGesture = () => {
          if (userPausedBgm) {
            updateBgmState();
            return;
          }
          if (bgmAudio.error) {
            updateBgmState('unavailable');
            return;
          }
          if (!hasStoredMutePreference || getPreference('francis-bgm-muted') !== 'true') {
            bgmAudio.muted = false;
            syncMutedAttribute();
            if (bgmAudio.volume === 0) {
              bgmAudio.volume = defaultVolume;
              bgmVolume.value = String(defaultVolume);
              setPreference('francis-bgm-volume', String(defaultVolume));
            }
            setPreference('francis-bgm-muted', 'false');
          }
          attemptBgmPlay({ mutedFallback: getPreference('francis-bgm-muted') === 'true' });
        };

        bgmShell.addEventListener('click', () => {
          resetBgmCollapseTimer();
        });

        bgmPlayToggle.addEventListener('click', () => {
          resetBgmCollapseTimer();
          if (bgmAudio.error) {
            updateBgmState('unavailable');
            return;
          }
          if (bgmAudio.paused) {
            userPausedBgm = false;
            bgmAudio.muted = false;
            syncMutedAttribute();
            if (bgmAudio.volume === 0) setBgmVolume(defaultVolume);
            setPreference('francis-bgm-muted', 'false');
            attemptBgmPlay({ mutedFallback: false });
            return;
          }
          userPausedBgm = true;
          bgmAudio.pause();
          updateBgmState();
        });

        bgmMuteToggle.addEventListener('click', () => {
          resetBgmCollapseTimer();
          if (bgmAudio.error) {
            updateBgmState('unavailable');
            return;
          }
          if (bgmAudio.muted || bgmAudio.volume === 0) {
            userPausedBgm = false;
            bgmAudio.muted = false;
            syncMutedAttribute();
            if (bgmAudio.volume === 0) setBgmVolume(defaultVolume);
            setPreference('francis-bgm-muted', 'false');
            attemptBgmPlay({ mutedFallback: false });
            return;
          }
          bgmAudio.muted = !bgmAudio.muted;
          syncMutedAttribute();
          setPreference('francis-bgm-muted', String(bgmAudio.muted));
          updateBgmState();
        });

        bgmVolume.addEventListener('input', (event) => {
          resetBgmCollapseTimer();
          setBgmVolume(event.target.value);
          if (!userPausedBgm && !bgmAudio.muted && bgmAudio.paused) attemptBgmPlay({ mutedFallback: false });
        });

        bgmAudio.addEventListener('play', () => updateBgmState());
        bgmAudio.addEventListener('pause', () => updateBgmState());
        bgmAudio.addEventListener('volumechange', () => updateBgmState());
        bgmAudio.addEventListener('error', () => {
          bgmPlayToggle.disabled = true;
          bgmMuteToggle.disabled = true;
          bgmVolume.disabled = true;
          updateBgmState('unavailable');
        });
        bgmAudio.addEventListener('canplay', () => {
          startBgmAutoplay();
        }, { once: true });

        const startBgmAutoplay = () => {
          if (userPausedBgm) {
            updateBgmState();
            return;
          }
          attemptBgmPlay();
        };
        if (document.readyState === 'complete') {
          window.setTimeout(startBgmAutoplay, 0);
        } else {
          window.addEventListener('load', startBgmAutoplay, { once: true });
        }

        const unlockBgmOnInteraction = (event) => {
          if (event.target?.closest?.('#bgm-control')) return;
          if (!userPausedBgm && (bgmAudio.paused || bgmAudio.muted)) startBgmFromGesture();
        };
        document.addEventListener('pointerdown', unlockBgmOnInteraction, { passive: true });
        document.addEventListener('keydown', unlockBgmOnInteraction);
        document.addEventListener('pointerdown', (event) => {
          if (event.target?.closest?.('#bgm-control')) return;
          window.clearTimeout(collapseTimer);
          setBgmExpanded(false);
        }, { passive: true });
        const canHoverBgm = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const bgmActivityEvents = canHoverBgm
          ? ['pointerenter', 'pointermove', 'focusin', 'keydown']
          : ['focusin', 'keydown'];
        bgmActivityEvents.forEach((eventName) => {
          bgmControl.addEventListener(eventName, resetBgmCollapseTimer, { passive: eventName !== 'keydown' });
        });
        bgmControl.addEventListener('focusout', () => {
          window.setTimeout(() => {
            if (bgmControl.matches(':focus-within')) return;
            window.clearTimeout(collapseTimer);
            collapseTimer = window.setTimeout(() => setBgmExpanded(false), 800);
          }, 0);
        });

        updateBgmState();
        setBgmExpanded(false);
        [150, 500, 1200, 2600, 5000].forEach((delay) => {
          window.setTimeout(startBgmAutoplay, delay);
        });
      }

      // Hero particle field
      const hero = document.getElementById('hero');
      const heroCanvas = document.getElementById('hero-particle-canvas');
      if (hero && heroCanvas) {
        const ctx = heroCanvas.getContext('2d', { alpha: true });
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const finePointer = window.matchMedia('(pointer: fine)');
        let width = 0;
        let height = 0;
        let dpr = 1;
        let rafId = null;
        let visible = true;
        let lastTime = 0;
        const particles = [];
        const ripples = [];
        const pointer = { x: 0, y: 0, active: false };
        const smoothPointer = { x: 0, y: 0 };

        class HeroParticle {
          constructor() {
            this.reset(true);
          }

          reset(initial = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            const angle = Math.random() * Math.PI * 2;
            const speed = initial ? Math.random() * 0.2 : 0.25 + Math.random() * 0.35;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.baseRadius = 0.65 + Math.random() * 1.45;
            this.radius = this.baseRadius;
            this.phase = Math.random() * Math.PI * 2;
            this.hue = 202 + Math.random() * 34;
          }

          step(time, delta) {
            const t = time * 0.001;
            this.phase += 0.012 * delta;

            if (finePointer.matches && pointer.active) {
              const dx = smoothPointer.x - this.x;
              const dy = smoothPointer.y - this.y;
              const distSq = dx * dx + dy * dy + 1200;
              const pull = 1600 / distSq;
              this.vx += dx * pull * 0.006 * delta;
              this.vy += dy * pull * 0.006 * delta;
            }

            for (let i = 0; i < ripples.length; i += 1) {
              const ripple = ripples[i];
              const dx = this.x - ripple.x;
              const dy = this.y - ripple.y;
              const distance = Math.hypot(dx, dy);
              const ring = Math.abs(distance - ripple.radius);
              if (ring < 42 && ripple.strength > 0.04) {
                const push = ((42 - ring) / 42) * ripple.strength * 0.18;
                this.vx += (dx / (distance || 1)) * push;
                this.vy += (dy / (distance || 1)) * push;
              }
            }

            this.vx += Math.sin(this.phase) * 0.0018 * delta;
            this.vy += Math.cos(this.phase * 0.8) * 0.0018 * delta;
            this.vx *= 0.992;
            this.vy *= 0.992;
            this.x += this.vx * delta;
            this.y += this.vy * delta;

            if (this.x < -24) this.x = width + 24;
            if (this.x > width + 24) this.x = -24;
            if (this.y < -24) this.y = height + 24;
            if (this.y > height + 24) this.y = -24;

            this.radius = this.baseRadius + Math.sin(t * 1.8 + this.phase) * 0.18;
          }

          draw() {
            const glow = this.radius * 5;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glow);
            gradient.addColorStop(0, `hsla(${this.hue}, 88%, 52%, .46)`);
            gradient.addColorStop(0.42, `hsla(${this.hue}, 90%, 58%, .16)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glow, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const targetCount = () => {
          const area = width * height;
          if (width < 520) return 46;
          if (area < 600000) return 68;
          if (area < 1000000) return 92;
          return 118;
        };

        const resizeHeroParticles = () => {
          const rect = hero.getBoundingClientRect();
          width = Math.max(1, Math.round(rect.width));
          height = Math.max(1, Math.round(rect.height));
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          heroCanvas.width = Math.floor(width * dpr);
          heroCanvas.height = Math.floor(height * dpr);
          heroCanvas.style.width = `${width}px`;
          heroCanvas.style.height = `${height}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const count = targetCount();
          while (particles.length < count) particles.push(new HeroParticle());
          particles.length = count;

          pointer.x = width * 0.62;
          pointer.y = height * 0.42;
          smoothPointer.x = pointer.x;
          smoothPointer.y = pointer.y;
        };

        const drawConnections = () => {
          const maxDistance = Math.min(width, height) * (width < 520 ? 0.11 : 0.085);
          const maxDistanceSq = maxDistance * maxDistance;
          for (let i = 0; i < particles.length; i += 1) {
            for (let j = i + 1; j < particles.length; j += 1) {
              const a = particles[i];
              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const distSq = dx * dx + dy * dy;
              if (distSq > maxDistanceSq) continue;
              const alpha = (1 - Math.sqrt(distSq) / maxDistance) * 0.16;
              ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
              ctx.lineWidth = 0.65;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        };

        const drawParticleVignette = () => {
          const gradient = ctx.createRadialGradient(
            width * 0.55,
            height * 0.45,
            Math.min(width, height) * 0.1,
            width * 0.55,
            height * 0.5,
            Math.max(width, height) * 0.7
          );
          gradient.addColorStop(0, 'rgba(255,255,255,0)');
          gradient.addColorStop(1, 'rgba(255,255,255,.42)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        };

        const drawHeroParticles = (time = 0) => {
          ctx.clearRect(0, 0, width, height);
          ctx.globalCompositeOperation = 'multiply';
          drawConnections();
          ctx.globalCompositeOperation = 'source-over';
          particles.forEach((particle) => particle.draw());
          drawParticleVignette();

          if (reduceMotion.matches || !visible) return;

          const delta = Math.min((time - lastTime) / 16.67 || 1, 2.2);
          lastTime = time;
          smoothPointer.x += (pointer.x - smoothPointer.x) * 0.07 * delta;
          smoothPointer.y += (pointer.y - smoothPointer.y) * 0.07 * delta;

          for (let i = ripples.length - 1; i >= 0; i -= 1) {
            ripples[i].radius += 6.8 * delta;
            ripples[i].strength *= 0.966;
            if (ripples[i].strength < 0.025) ripples.splice(i, 1);
          }

          particles.forEach((particle) => particle.step(time, delta));
          rafId = window.requestAnimationFrame(drawHeroParticles);
        };

        const startHeroParticles = () => {
          if (rafId || reduceMotion.matches || !visible) return;
          lastTime = performance.now();
          rafId = window.requestAnimationFrame(drawHeroParticles);
        };

        const stopHeroParticles = () => {
          if (!rafId) return;
          window.cancelAnimationFrame(rafId);
          rafId = null;
        };

        const pointerToHero = (event) => {
          const rect = hero.getBoundingClientRect();
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          };
        };

        hero.addEventListener('pointermove', (event) => {
          const point = pointerToHero(event);
          pointer.x = point.x;
          pointer.y = point.y;
          pointer.active = true;
        }, { passive: true });

        hero.addEventListener('pointerleave', () => {
          pointer.active = false;
        });

        hero.addEventListener('pointerdown', (event) => {
          if (event.target.closest('a, button, input, textarea, select')) return;
          const point = pointerToHero(event);
          ripples.push({ x: point.x, y: point.y, radius: 0, strength: 1 });
          if (ripples.length > 4) ripples.shift();
        });

        const handleMotionPreferenceChange = () => {
          stopHeroParticles();
          particles.forEach((particle) => {
            particle.vx = 0;
            particle.vy = 0;
          });
          drawHeroParticles(0);
          startHeroParticles();
        };
        if (typeof reduceMotion.addEventListener === 'function') {
          reduceMotion.addEventListener('change', handleMotionPreferenceChange);
        } else {
          reduceMotion.addListener(handleMotionPreferenceChange);
        }

        const observer = 'IntersectionObserver' in window
          ? new IntersectionObserver((entries) => {
              visible = entries[0]?.isIntersecting ?? true;
              if (visible) startHeroParticles();
              else stopHeroParticles();
            }, { threshold: 0.05 })
          : null;
        observer?.observe(hero);

        window.addEventListener('resize', () => {
          resizeHeroParticles();
          drawHeroParticles(0);
        }, { passive: true });

        resizeHeroParticles();
        drawHeroParticles(0);
        startHeroParticles();
      }

      // Set current year in footer
      document.getElementById('year').textContent = new Date().getFullYear();

      // Tab switching logic for works section
      const tabs = document.querySelectorAll('.tab');
      const tabContents = document.querySelectorAll('.tab-content');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          tabContents.forEach(c => c.classList.add('hidden'));
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          const target = tab.getAttribute('data-target');
          document.getElementById(target).classList.remove('hidden');
        });
      });

      // Contact form mailto composer
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        const contactPresets = {
          collaboration: {
            intent: 'Research collaboration',
            subject: 'Research collaboration inquiry for Dr. Francis Jesmar P. Montalbo',
            message: 'Hello Dr. Montalbo,\n\nI would like to collaborate.\n\nTopic:\nOrganization:\nTimeline:\n\nThank you.'
          },
          consulting: {
            intent: 'AI consulting',
            subject: 'AI consulting inquiry for Dr. Francis Jesmar P. Montalbo',
            message: 'Hello Dr. Montalbo,\n\nI would like to ask about AI consulting support.\n\nProject:\nGoal:\nTimeline:\n\nThank you.'
          },
          speaking: {
            intent: 'Invited talk or workshop',
            subject: 'Speaking or workshop invitation for Dr. Francis Jesmar P. Montalbo',
            message: 'Hello Dr. Montalbo,\n\nI would like to invite you for a talk or workshop.\n\nEvent:\nAudience:\nDate or timeline:\n\nThank you.'
          },
          partnership: {
            intent: 'Academic or industry partnership',
            subject: 'Partnership inquiry for Dr. Francis Jesmar P. Montalbo',
            message: 'Hello Dr. Montalbo,\n\nI would like to explore a possible partnership.\n\nOrganization:\nPartnership idea:\nTimeline:\n\nThank you.'
          }
        };
        const contactIntent = document.getElementById('contact-intent');
        const contactName = document.getElementById('contact-name');
        const contactOrganization = document.getElementById('contact-organization');
        const contactSubject = document.getElementById('contact-subject');
        const contactMessage = document.getElementById('contact-message');
        const contactDestinationInput = document.getElementById('contact-destination-value');
        const contactDestinationButtons = document.querySelectorAll('[data-contact-destination]');
        const contactReviewTo = document.getElementById('contact-review-to');
        const contactReviewService = document.getElementById('contact-review-service');
        const contactReviewSubject = document.getElementById('contact-review-subject');
        const contactReviewMessage = document.getElementById('contact-review-message');
        const contactNote = document.getElementById('contact-form-note');
        const contactTemplateButtons = document.querySelectorAll('[data-contact-preset]');
        const previousPresetMessages = new Set(Object.values(contactPresets).map((preset) => preset.message));
        const contactDestinations = {
          professional: {
            label: 'Professional email',
            address: 'francismontalbo@ieee.org'
          },
          university: {
            label: 'University email',
            address: 'francisjesmar.montalbo@g.batstate-u.edu.ph'
          }
        };
        let activeContactPreset = 'collaboration';
        let activeContactDestination = 'professional';

        const setContactNote = (text) => {
          if (contactNote) contactNote.textContent = text;
        };

        const getActiveContactDestination = () => contactDestinations[activeContactDestination] || contactDestinations.professional;

        const buildMailtoHref = ({ destination, subject, body }) => (
          `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        );

        const updateContactReview = () => {
          const destination = getActiveContactDestination();
          const preset = contactPresets[activeContactPreset] || contactPresets.collaboration;
          const subject = contactSubject?.value.trim() || preset.subject;
          const intent = contactIntent?.value.trim() || preset.intent;
          const message = contactMessage?.value.trim() || preset.message;
          const compactMessage = message.replace(/\s+/g, ' ').trim();
          if (contactReviewTo) contactReviewTo.textContent = `${destination.label}: ${destination.address}`;
          if (contactReviewService) contactReviewService.textContent = intent;
          if (contactReviewSubject) contactReviewSubject.textContent = subject;
          if (contactReviewMessage) contactReviewMessage.textContent = compactMessage.length > 180 ? `${compactMessage.slice(0, 177)}...` : compactMessage;
        };

        const setContactDestination = (key, { announce = true } = {}) => {
          activeContactDestination = contactDestinations[key] ? key : 'professional';
          const destination = getActiveContactDestination();
          if (contactDestinationInput) contactDestinationInput.value = destination.address;
          contactDestinationButtons.forEach((button) => {
            const isSelected = button.dataset.contactDestination === activeContactDestination;
            button.classList.toggle('is-active', isSelected);
            button.setAttribute('aria-checked', String(isSelected));
          });
          updateContactReview();
          if (announce) setContactNote(`${destination.label} selected.`);
        };

        const setContactPreset = (key, { overwriteMessage = true } = {}) => {
          const preset = contactPresets[key] || contactPresets.collaboration;
          const destination = getActiveContactDestination();
          activeContactPreset = contactPresets[key] ? key : 'collaboration';
          if (contactIntent) contactIntent.value = preset.intent;
          if (contactSubject) contactSubject.value = preset.subject;
          if (contactMessage && (overwriteMessage || !contactMessage.value.trim() || previousPresetMessages.has(contactMessage.value))) {
            contactMessage.value = preset.message;
          }
          contactTemplateButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.contactPreset === activeContactPreset);
          });
          updateContactReview();
          setContactNote(`${preset.intent} template selected for ${destination.label.toLowerCase()}.`);
          return preset;
        };

        const getContactDraft = () => {
          const preset = contactPresets[activeContactPreset] || contactPresets.collaboration;
          const name = contactName?.value.trim();
          const organization = contactOrganization?.value.trim();
          const subject = contactSubject?.value.trim() || preset.subject;
          const message = contactMessage?.value.trim() || preset.message;
          const intent = contactIntent?.value.trim() || preset.intent;
          const destination = contactDestinationInput?.value || getActiveContactDestination().address;
          const details = [
            name ? `Name: ${name}` : '',
            organization ? `Organization: ${organization}` : '',
            `Inquiry type: ${intent}`
          ].filter(Boolean).join('\n');
          const body = `${details}\n\nMessage:\n${message}`;
          return { destination, subject, body };
        };

        const openContactDraft = () => {
          const draft = getContactDraft();
          window.location.href = buildMailtoHref(draft);
        };

        const copyText = (text) => {
          if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
          return Promise.resolve();
        };

        contactTemplateButtons.forEach((button) => {
          button.addEventListener('click', () => {
            setContactPreset(button.dataset.contactPreset, { overwriteMessage: true });
            if (button.dataset.contactOpen === 'true') openContactDraft();
          });
        });

        contactDestinationButtons.forEach((button) => {
          button.addEventListener('click', () => {
            setContactDestination(button.dataset.contactDestination);
          });
        });

        [contactName, contactOrganization, contactMessage].forEach((field) => {
          field?.addEventListener('input', updateContactReview);
        });

        document.getElementById('contact-copy-draft')?.addEventListener('click', () => {
          const draft = getContactDraft();
          copyText(`To: ${draft.destination}\nSubject: ${draft.subject}\n\n${draft.body}`)
            .then(() => setContactNote('Email draft copied.'))
            .catch(() => setContactNote('Copy failed. You can still open the email draft.'));
        });

        contactForm.addEventListener('submit', (event) => {
          event.preventDefault();
          openContactDraft();
        });

        setContactDestination(activeContactDestination, { announce: false });
        setContactPreset(activeContactPreset, { overwriteMessage: false });
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
      const bindFallbackChatbotShell = () => {
        if (!chatbotFab || !chatbotWidget) return;
        if (chatbotFab.dataset.boundLiveToggle === '1' || chatbotWidget.dataset.boundLiveToggle === '1') return;
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
      };
      window.setTimeout(bindFallbackChatbotShell, 900);

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
