const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => n.toLocaleString('ru').replace(/,/g, ' ') + " so'm";

const toast = m => {
    $('#toast').textContent = m;
    $('#toast').classList.add('on');
    setTimeout(() => $('#toast').classList.remove('on'), 2500);
};

let p = 0;
const lt = setInterval(() => {
    p = Math.min(100, p + Math.random() * 12);
    $('#lbar').style.width = p + '%';
    $('#lpct').textContent = Math.floor(p) + '%';
    if (p >= 100) {
        clearInterval(lt);
        setTimeout(() => $('#loader').classList.add('hide'), 300);
    }
}, 80);

const h = $('#htitle');
h.innerHTML = h.innerHTML.split(/(<i>.*?<\/i>|\s+)/).filter(w => w.trim()).map((w, i) =>
    `<span class="w" style="animation-delay:${1.8 + i * .15}s">${w}</span>`
).join(' ');

addEventListener('scroll', () => {
    const s = scrollY;
    $('#nav').classList.toggle('scrolled', s > 50);
    $('#progress').style.width = (s / (document.body.scrollHeight - innerHeight) * 100) + '%';
    $('#heroimg').style.transform = `translateY(${s * .15}px)`;
});

const count = el => {
    const n = +el.dataset.n;
    let c = 0;
    const t = setInterval(() => {
        c += n / 60;
        if (c >= n) {
            c = n;
            clearInterval(t);
        }
        el.textContent = Math.floor(c).toLocaleString();
    }, 25);
};

const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('show');
    e.target.querySelectorAll('[data-n]').forEach(count);
    io.unobserve(e.target);
}), { threshold: .15 });

$$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * .15 + 's';
    io.observe(el);
});

$$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
});

let cart = JSON.parse(localStorage.getItem('luxcart') || '[]');

const render = () => {
    localStorage.setItem('luxcart', JSON.stringify(cart));
    $('#cnt').textContent = cart.reduce((a, i) => a + i.q, 0);
    $('#sum').textContent = fmt(cart.reduce((a, i) => a + i.q * i.price, 0));
    $('#items').innerHTML = cart.length 
        ? cart.map((i, k) => `
            <div class="it">
                <img src="${i.img}">
                <div>
                    <b>${i.name}</b><br>
                    <small>${i.q} × ${fmt(i.price)}</small>
                </div>
                <button data-k="${k}" data-d="-1">−</button>
                <button data-k="${k}" data-d="1">+</button>
            </div>`).join('') 
        : '<p class="empty">Savat hozircha bo\'sh</p>';
};

$$('.add').forEach(b => b.addEventListener('click', () => {
    const d = b.closest('.card').dataset;
    const f = cart.find(i => i.name === d.name);
    f ? f.q++ : cart.push({ name: d.name, price: +d.price, img: d.img, q: 1 });
    render();
    b.classList.add('ok');
    b.textContent = '✓';
    setTimeout(() => {
        b.classList.remove('ok');
        b.textContent = '+';
    }, 1200);
    const cb = $('#openCart');
    cb.classList.remove('bump');
    void cb.offsetWidth;
    cb.classList.add('bump');
    toast(d.name + ' savatga qo\'shildi');
}));

$('#items').addEventListener('click', e => {
    const k = e.target.dataset.k;
    if (k === undefined) return;
    cart[k].q += +e.target.dataset.d;
    if (cart[k].q < 1) cart.splice(k, 1);
    render();
});

const tg = o => document.body.classList.toggle('open', o);
$('#openCart').onclick = () => tg(true);
$('#closeCart').onclick = $('#overlay').onclick = () => tg(false);

$('#checkout').onclick = () => {
    if (!cart.length) return toast('Avval sumka tanlang');
    cart = [];
    render();
    tg(false);
    toast('✓ Buyurtma qabul qilindi!');
};

render();

['#form', '#nform'].forEach(id => $(id).addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast('✓ Rahmat! Tez orada bog\'lanamiz');
}));