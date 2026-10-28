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
    nextLabel.textContent = `Próxima aula em ${minutes} min`;
  };
  updateLiveData();
  window.setInterval(updateLiveData, 1000);
  if (!reduceMotion) window.setInterval(() => { bpm.textContent = String(124 + Math.floor(Math.random() * 10)); }, 1700);

  const prescriptions = {
    musculacao: {
      image: 'assets/images/forca.avif', alt: 'Área de musculação com equipamentos modernos', code: 'MUSC / 01',
      label: 'Força & Hipertrofia', title: 'Musculação de ponta.',
      description: 'Estrutura completa com aparelhos biomecânicos modernos, ampla área de pesos livres e halteres para todos os níveis de treino.',
      duration: 'Climatizado', intensity: 'Completa', spots: 'Instrutores', time: 'Livre acesso'
    },
    cardio: {
      image: 'assets/images/hiit.avif', alt: 'Área de cardio com esteiras e simuladores', code: 'CARD / 02',
      label: 'Cardio & Emagrecimento', title: 'Área cardio ampla.',
      description: 'Esteiras de última geração com absorção de impacto, simuladores de escada, elípticos e bikes para queimar calorias e melhorar seu fôlego.',
      duration: 'Panorâmico', intensity: 'Alta tecnologia', spots: 'Liberado', time: 'Livre acesso'
    },
    coletivas: {
      image: 'assets/images/mobilidade.avif', alt: 'Alunos praticando aula coletiva em sala ampla', code: 'AULA / 03',
      label: 'Aulas em Grupo', title: 'Aulas dinâmicas.',
      description: 'Salas exclusivas para Spinning, FitDance, Pilates solo, GAP e Treino Funcional. Professores animados e turmas com energia contagiante.',
      duration: 'Dedicadas', intensity: 'Todos os níveis', spots: '100% inclusas', time: 'Consulte a grade'
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
      showToast('Modalidade atualizada.');
    });
  });

  const dayButtons = [...document.querySelectorAll('.day-selector button')];
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const scheduleSets = [
    [['06:30','Spinning Power','Cardio & Queima · Prof. Marcos','Intenso','Vagas livres','75%'],['08:00','Pilates Solo','Postura & Core · Profa. Camila','Regenerativo','Vagas livres','50%'],['18:30','FitDance & Ritmos','Dança & Energia · Profa. Lari','Moderado','Últimas vagas','88%'],['19:30','Circuito Funcional','Condicionamento · Prof. Bruno','Intenso','Vagas livres','70%']],
    [['07:00','GAP & Glúteos','Tonificação · Profa. Juliana','Moderado','Vagas livres','60%'],['12:15','Spinning Express','Cardio Almoço · Prof. Marcos','Intenso','Vagas livres','80%'],['18:00','Alongamento & Flex','Mobilidade & Relax · Profa. Camila','Regenerativo','Vagas livres','45%'],['19:15','Muay Thai & Boxe','Defesa & Cardio · Prof. Rodrigo','Intenso','Últimas vagas','92%']],
    [['06:30','Spinning Power','Cardio & Queima · Prof. Marcos','Intenso','Vagas livres','72%'],['09:00','Pilates Solo','Postura & Core · Profa. Camila','Regenerativo','Vagas livres','55%'],['18:30','FitDance & Ritmos','Dança & Energia · Profa. Lari','Moderado','Últimas vagas','85%'],['19:45','Cross Funcional','Força & Resistência · Prof. Bruno','Intenso','Vagas livres','78%']],
    [['07:00','GAP & Glúteos','Tonificação · Profa. Juliana','Moderado','Vagas livres','65%'],['12:15','HIIT Circuit','Queima Rápida · Prof. Bruno','Intenso','Vagas livres','70%'],['18:00','Alongamento & Relax','Alívio de Tensões · Profa. Camila','Regenerativo','Vagas livres','40%'],['19:15','Spinning Noturno','Bike Indoor · Prof. Marcos','Intenso','Últimas vagas','88%']],
    [['06:30','Spinning Power','Cardio & Disposição · Prof. Marcos','Intenso','Vagas livres','68%'],['08:30','Pilates Solo','Alongamento & Core · Profa. Camila','Regenerativo','Vagas livres','50%'],['18:00','Sextou FitDance','Ritmos & Animação · Profa. Lari','Moderado','Últimas vagas','90%'],['19:15','Circuito Funcional','Resistência Geral · Prof. Bruno','Intenso','Vagas livres','62%']],
    [['08:30','Super Spinning','Cardio Especial · Prof. Marcos','Intenso','Vagas livres','82%'],['09:45','Aulão Ritmos','Energia Total · Profa. Lari','Moderado','Últimas vagas','95%'],['11:00','Alongamento & Recovery','Descompressão Muscular · Profa. Camila','Regenerativo','Vagas livres','48%'],['15:00','Musculação Guiada','Tira-dúvidas e Treino · Instrutor','Moderado','Livre acesso','55%']]
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
        book.setAttribute('aria-label', `Reservar ${data[1]} às ${data[0]}`);
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

  const plans = {
    2: { name: 'Plano 2x Semana', sessions: '8 acessos no mês', price: '99', note: 'Ideal para quem está começando e quer encaixar o treino na rotina com economia.' },
    3: { name: 'Plano 3x Semana', sessions: '12 acessos no mês', price: '129', note: 'A frequência mais escolhida: ótimo equilíbrio entre consistência, resultados e descanso.' },
    4: { name: 'Plano 4x Semana', sessions: '16 acessos no mês', price: '149', note: 'Excelente ritmo para quem deseja alternar musculação pesada e aulas coletivas na semana.' },
    5: { name: 'Acesso Livre Total', sessions: 'Acesso ilimitado de seg a sex', price: '169', note: 'Treine quando e quanto quiser, com musculação e todas as aulas coletivas 100% inclusas.' },
    6: { name: 'Plano Total VIP', sessions: 'Acesso livre dom a dom + 1 convidado', price: '189', note: 'Acesso irrestrito 7 dias por semana, todas as aulas e direito a trazer 1 amigo aos sábados.' }
  };
  const range = document.getElementById('frequency-range');
  const updatePlan = () => {
    const value = Number(range.value);
    const plan = plans[value];
    range.style.setProperty('--range', `${((value - 2) / 4) * 100}%`);
    document.getElementById('frequency-value').textContent = value;
    document.getElementById('frequency-note').textContent = plan.note;
    document.getElementById('plan-code').textContent = value < 5 ? `PLANO / ${String(value).padStart(2, '0')}X` : (value === 5 ? 'LIVRE / TOTAL' : 'TOTAL / VIP');
    document.getElementById('plan-name').textContent = plan.name;
    document.getElementById('plan-sessions').textContent = plan.sessions;
    document.getElementById('plan-price').textContent = plan.price;
  };
  range.addEventListener('input', updatePlan);
  range.addEventListener('change', () => showToast('Plano ajustado ao seu ritmo.'));
  updatePlan();

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
      showToast('Free Pass solicitado!');
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
