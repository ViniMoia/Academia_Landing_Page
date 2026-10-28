document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.7 } });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const header = document.getElementById('site-header');
  const progress = document.querySelector('.scroll-progress span');
  const hero = document.getElementById('inicio');
  const heroVideo = document.getElementById('hero-video');
  const videoControl = document.getElementById('video-control');
  const heroStillQuery = window.matchMedia('(aspect-ratio < 16/9)');
  const cursor = document.querySelector('.cursor-orbit');
  let manualVideoPause = false;
  let ticking = false;

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${ratio})`;
    header.classList.toggle('scrolled', window.scrollY > 56);
    const community = document.querySelector('.community-media img');
    if (community && !reduceMotion) {
      const rect = community.closest('.community').getBoundingClientRect();
      const shift = Math.max(-9, Math.min(9, (rect.top / window.innerHeight) * -8));
      community.style.setProperty('--community-shift', `${shift}%`);
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  if (!reduceMotion) {
    document.querySelectorAll('.hero-title .title-line > span').forEach((line, index) => {
      line.animate(
        [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }],
        { duration: 1050, delay: 120 + index * 100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
      );
    });
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  };
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const revealItems = document.querySelectorAll('.reveal, .reveal-child');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5%' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-38% 0px -54%', threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      cursor.classList.add('is-visible');
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.querySelectorAll('a, button, input, select, .method-step').forEach((target) => {
      target.addEventListener('pointerenter', () => cursor.classList.add('is-active'));
      target.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    });

    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });

    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  document.querySelectorAll('.spotlight').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    });
  });

  const syncVideoButton = () => {
    const paused = heroVideo.paused;
    const icon = videoControl.querySelector('svg');
    videoControl.querySelector('[data-video-label]').textContent = paused ? 'Retomar atmosfera' : 'Pausar atmosfera';
    videoControl.setAttribute('aria-label', paused ? 'Retomar vídeo' : 'Pausar vídeo');
    if (icon) icon.outerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}"></i>`;
    if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.7 } });
  };

  videoControl.addEventListener('click', () => {
    if (heroVideo.paused) {
      manualVideoPause = false;
      heroVideo.play().catch(() => {});
    } else {
      manualVideoPause = true;
      heroVideo.pause();
    }
    window.setTimeout(syncVideoButton, 20);
  });

  if (reduceMotion || heroStillQuery.matches) {
    heroVideo.pause();
    syncVideoButton();
  } else if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !heroStillQuery.matches && !manualVideoPause && !document.hidden) heroVideo.play().catch(() => {});
      else heroVideo.pause();
      syncVideoButton();
    }, { threshold: 0.2 });
    videoObserver.observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else if (!heroStillQuery.matches && !manualVideoPause && hero.getBoundingClientRect().bottom > 0) heroVideo.play().catch(() => {});
    syncVideoButton();
  });

  const syncHeroMedia = () => {
    if (reduceMotion || heroStillQuery.matches) heroVideo.pause();
    else if (!manualVideoPause && !document.hidden && hero.getBoundingClientRect().bottom > 0) heroVideo.play().catch(() => {});
    syncVideoButton();
  };
  if (heroStillQuery.addEventListener) heroStillQuery.addEventListener('change', syncHeroMedia);
  else heroStillQuery.addListener(syncHeroMedia);

  const clock = document.querySelector('.console-time');
  const bpm = document.querySelector('[data-bpm]');
  const nextLabel = document.querySelector('[data-next-label]');
  const updateLiveData = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('pt-BR', { hour12: false });
    const minutes = 15 - (now.getMinutes() % 15);
    nextLabel.textContent = `Próximo pulso em ${minutes} min`;
  };
  updateLiveData();
  window.setInterval(updateLiveData, 1000);
  if (!reduceMotion) window.setInterval(() => { bpm.textContent = String(124 + Math.floor(Math.random() * 10)); }, 1700);

  const prescriptions = {
    potencia: {
      image: 'assets/images/forca.avif', alt: 'Área de musculação e pesos livres na academia', code: 'FIT / MUSCULAÇÃO',
      label: 'Setor de Força & Hipertrofia', title: 'Musculação de Ponta.',
      description: 'Equipamentos biomecânicos de última geração, halteres até 50kg, anilhas olímpicas e instrutores sempre no salão para montar seu treino e acompanhar sua postura.',
      duration: 'Livre', intensity: 'Todos', spots: 'No salão', time: 'Hoje, Horário Livre'
    },
    folego: {
      image: 'assets/images/hiit.avif', alt: 'Área de cardio com esteiras e elípticos', code: 'FIT / CARDIO',
      label: 'Setor Cardio & Queima Calórica', title: 'Cardio & Funcional.',
      description: 'Linha completa de esteiras com TV, escadas ergométricas, bikes e espaço funcional amplo para queimar calorias, emagrecer e turbinar seu fôlego.',
      duration: 'Livre', intensity: 'Variável', spots: '+40 aparelhos', time: 'Hoje, Horário Livre'
    },
    fluxo: {
      image: 'assets/images/mobilidade.avif', alt: 'Alunos em sala de aula coletiva e alongamento', code: 'FIT / COLETIVAS',
      label: 'Salas de Ginástica & Ritmos', title: 'Aulas Coletivas Inclusas.',
      description: 'Spinning, FitDance, Jump, Pilates solo, GAP e Alongamento. Aulas dinâmicas com professores que motivam você do início ao fim.',
      duration: '45-60 min', intensity: 'Moderada', spots: 'Grade diária', time: 'Hoje, Grade Completa'
    }
  };
  const prescriptionCard = document.getElementById('prescription-card');
  const prescriptionImage = document.getElementById('prescription-image');
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (message) => {
    toast.querySelector('span').textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };

  document.querySelectorAll('.state-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const data = prescriptions[tab.dataset.state];
      document.querySelectorAll('.state-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      prescriptionImage.style.opacity = '0';
      prescriptionCard.style.transform = 'scale(.985)';
      window.setTimeout(() => {
        prescriptionImage.src = data.image;
        prescriptionImage.alt = data.alt;
        document.getElementById('prescription-code').textContent = data.code;
        document.getElementById('prescription-label').textContent = data.label;
        document.getElementById('prescription-title').textContent = data.title;
        document.getElementById('prescription-description').textContent = data.description;
        document.getElementById('metric-duration').textContent = data.duration;
        document.getElementById('metric-intensity').textContent = data.intensity;
        document.getElementById('metric-spots').textContent = data.spots;
        const book = prescriptionCard.querySelector('[data-book]');
        book.dataset.class = data.title.replace('.', '');
        book.dataset.time = data.time;
        prescriptionImage.style.opacity = '1';
        prescriptionCard.style.transform = '';
      }, reduceMotion ? 0 : 220);
      showToast('Espaço selecionado.');
    });
  });

  const dayButtons = [...document.querySelectorAll('.day-selector button')];
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const scheduleSets = [
    [['06:30','Spinning / Bike','Sala Cardio · Prof. Thiago','Intenso','8 vagas','60%'],['09:00','Pilates Solo','Sala 02 · Profa. Mariana','Regenerativo','12 vagas','40%'],['18:30','FitDance & Ritmos','Sala 01 · Prof. Lucas','Intenso','5 vagas','80%'],['19:30','GAP & Glúteos','Sala 02 · Profa. Camila','Moderado','10 vagas','50%']],
    [['07:00','Circuito Funcional','Área Funcional · Prof. Carlos','Intenso','6 vagas','70%'],['12:15','Alongamento & Flex','Sala 02 · Profa. Mariana','Regenerativo','14 vagas','30%'],['18:15','Spinning Extreme','Sala Cardio · Prof. Thiago','Intenso','4 vagas','85%'],['20:00','Muay Thai / Luta','Tatame · Prof. Rodrigo','Intenso','7 vagas','65%']],
    [['06:30','Spinning Power','Sala Cardio · Prof. Thiago','Intenso','6 vagas','72%'],['09:30','Localizada & Core','Sala 01 · Profa. Camila','Moderado','9 vagas','52%'],['18:30','FitDance Explosão','Sala 01 · Prof. Lucas','Intenso','3 vagas','88%'],['19:45','Yoga & Respiração','Sala 02 · Profa. Mariana','Regenerativo','11 vagas','35%']],
    [['07:00','HIIT Funcional','Área Funcional · Prof. Carlos','Intenso','5 vagas','75%'],['12:10','GAP & Abdômen','Sala 02 · Profa. Camila','Moderado','8 vagas','48%'],['18:30','Spinning / Bike','Sala Cardio · Prof. Thiago','Intenso','4 vagas','82%'],['20:00','Jiu-Jitsu / Luta','Tatame · Prof. Rodrigo','Intenso','6 vagas','60%']],
    [['06:30','Spinning Sexta','Sala Cardio · Prof. Thiago','Intenso','7 vagas','55%'],['12:15','Circuito Express','Área Funcional · Prof. Carlos','Moderado','8 vagas','45%'],['18:00','FitDance Sextou','Sala 01 · Prof. Lucas','Intenso','4 vagas','80%'],['19:15','Alongamento Geral','Sala 02 · Profa. Mariana','Regenerativo','12 vagas','35%']],
    [['08:30','Super Spinning','Sala Cardio · Prof. Thiago','Intenso','5 vagas','75%'],['09:30','FitDance Weekend','Sala 01 · Prof. Lucas','Intenso','6 vagas','70%'],['10:30','Funcional em Duplas','Área Funcional · Prof. Carlos','Moderado','8 vagas','60%'],['11:30','Pilates & Relax','Sala 02 · Profa. Mariana','Regenerativo','10 vagas','40%']]
  ];
  const today = new Date();
  dayButtons.forEach((button, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    button.querySelector('small').textContent = String(date.getDate()).padStart(2, '0');
    button.querySelector('span').textContent = weekday[date.getDay()];
    button.classList.toggle('is-active', index === 0);
    button.setAttribute('aria-selected', String(index === 0));
    const marker = button.querySelector('i');
    if (marker) marker.remove();
    if (index === 0) button.insertAdjacentHTML('beforeend', '<i>Hoje</i>');
  });

  const classList = document.querySelector('.class-list');
  const classRows = [...classList.querySelectorAll('.class-row')];
  const renderSchedule = (index) => {
    classList.classList.add('is-switching');
    window.setTimeout(() => {
      scheduleSets[index].forEach((data, rowIndex) => {
        const row = classRows[rowIndex];
        row.querySelector('.class-time').textContent = data[0];
        row.querySelector('.class-type strong').textContent = data[1];
        row.querySelector('.class-type small').textContent = data[2];
        const level = row.querySelector('.class-level');
        level.lastChild.textContent = ` ${data[3]}`;
        level.className = `class-level ${data[3] === 'Regenerativo' ? 'level-mint' : data[3] === 'Moderado' ? 'level-orange' : ''}`;
        row.querySelector('.class-capacity i').style.setProperty('--fill', data[5]);
        row.querySelector('.class-capacity small').textContent = data[4];
        const book = row.querySelector('[data-book]');
        book.dataset.class = data[1];
        book.dataset.time = `${dayButtons[index].querySelector('span').textContent}, ${data[0]}`;
        book.setAttribute('aria-label', `Reservar vaga em ${data[1]} às ${data[0]}`);
      });
      classList.classList.remove('is-switching');
    }, reduceMotion ? 0 : 180);
  };
  renderSchedule(0);
  dayButtons.forEach((button, index) => button.addEventListener('click', () => {
    dayButtons.forEach((item) => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-selected', String(item === button));
    });
    renderSchedule(index);
  }));

  const countItems = document.querySelectorAll('[data-count]');
  const animateCount = (element) => {
    const target = Number(element.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const progressValue = Math.min((now - start) / 1300, 1);
      const value = Math.round(target * (1 - Math.pow(1 - progressValue, 3)));
      element.textContent = value.toLocaleString('pt-BR');
      if (progressValue < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    countItems.forEach((item) => countObserver.observe(item));
  } else countItems.forEach((item) => { item.textContent = Number(item.dataset.count).toLocaleString('pt-BR'); });

  document.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const planName = btn.dataset.plan;
      showToast(`${planName} selecionado.`);
    });
  });

  document.querySelectorAll('select').forEach((select) => {
    const sync = () => select.closest('.select-field')?.classList.toggle('has-value', Boolean(select.value));
    select.addEventListener('change', sync);
    sync();
  });

  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '').slice(0, 11);
      if (digits.length > 6) input.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      else if (digits.length > 2) input.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      else if (digits.length) input.value = `(${digits}`;
    });
  });

  const trialForm = document.getElementById('trial-form');
  trialForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    trialForm.querySelectorAll('input[required], select[required]').forEach((field) => {
      const fieldValid = field.value.trim() && (field.type !== 'tel' || field.value.replace(/\D/g, '').length >= 10);
      field.closest('.field').classList.toggle('is-invalid', !fieldValid);
      field.setAttribute('aria-invalid', String(!fieldValid));
      if (!fieldValid) valid = false;
    });
    if (valid) {
      trialForm.classList.add('is-success');
      showToast('Free Pass solicitado com sucesso!');
    } else trialForm.querySelector('.is-invalid input, .is-invalid select')?.focus();
  });
  trialForm.querySelectorAll('input, select').forEach((field) => field.addEventListener('input', () => field.closest('.field').classList.remove('is-invalid')));

  const modal = document.getElementById('booking-modal');
  const dialog = modal.querySelector('.modal-dialog');
  const modalTitle = modal.querySelector('#modal-title');
  const modalTime = modal.querySelector('[data-modal-time]');
  let lastTrigger = null;
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    dialog.classList.remove('is-success');
    window.setTimeout(() => lastTrigger?.focus(), 20);
  };
  const openModal = (trigger) => {
    lastTrigger = trigger;
    modalTitle.textContent = trigger.dataset.class || 'Seu treino';
    modalTime.textContent = trigger.dataset.time || 'Hoje';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => modal.querySelector('.modal-close').focus(), 40);
  };
  document.querySelectorAll('[data-book]').forEach((button) => button.addEventListener('click', () => openModal(button)));
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.getElementById('booking-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = document.getElementById('booking-phone');
    if (phone.value.replace(/\D/g, '').length < 10) {
      phone.setAttribute('aria-invalid', 'true');
      phone.focus();
      return;
    }
    phone.removeAttribute('aria-invalid');
    dialog.classList.add('is-success');
  });
  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, input, a[href], select, [tabindex]:not([tabindex="-1"])')].filter((item) => !item.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
