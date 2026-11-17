/* =====================================================================
   CONFIGURAÇÃO ÚNICA — quiz.html e ventas.html leem tudo daqui.
   Mude preço, oferta, pixel e depoimentos SÓ neste arquivo.
   ===================================================================== */
window.SALOMON = {

  PIXEL_ID: 'SEU_PIXEL_ID',

  // Link base do checkout Hotmart (sem cupom, sem off=)
  CHECKOUT: 'https://pay.hotmart.com/S98233760N?checkoutMode=10',

  // DUAS ofertas na Hotmart (Produto > Ofertas). Cole o código do "off=" de cada uma.
  // O preço aqui TEM que ser igual ao preço da oferta na Hotmart.
  // Enquanto "offer" estiver vazio, o checkout cobra a oferta padrão do produto.
  REGULAR: { price: 14.90, offer: '' },   // preço cheio: tráfego direto, remarketing, afiliados
  QUIZ:    { price: 7.90,  offer: '' },   // preço desbloqueado por quem termina o quiz

  ANCHOR: 67,                             // soma dos valores da pilha de oferta

  // Para onde o botão do resultado do quiz leva:
  //   'checkout' = direto para a Hotmart   'ventas' = página de vendas
  //   'ab'       = metade para cada (a versão vai no src da Hotmart: "|chk" ou "|vta")
  // Com verba pequena (até ~R$ 100/dia), use 'checkout'. Passe para 'ab' quando tiver verba para comparar.
  RESULT_CTA: 'checkout',

  WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbytCSNdRMHA65XF8mzOd7s1CMTrtToff2TqaKoOLDqlLHwW119BXbbTekfArn9S08sLug/exec',

  /* DEPOIMENTOS — só de compradores REAIS, com autorização.
     Cada item: { texto:'...', nombre:'María G.', pais:'México', img:'depoimentos/maria.jpg' }
     "img" é opcional (print do WhatsApp). Com a lista vazia, as seções de depoimento
     ficam escondidas no quiz e na página de vendas. */
  TESTIMONIOS: [
  ]
};

/* ---------- funções compartilhadas (não precisa mexer) ---------- */
(function(S){
  var KEY = 'salomon_unlock';
  S.fmt = function(v){ return 'US$ ' + v.toFixed(2).replace('.', ','); };

  // quem terminou o quiz fica com o preço desbloqueado neste aparelho
  S.setUnlocked = function(){ try { localStorage.setItem(KEY, '1'); } catch(e){} };
  S.isUnlocked = function(qs){
    if (qs && qs.get('d') === '1') { S.setUnlocked(); return true; }
    try { return localStorage.getItem(KEY) === '1'; } catch(e){ return false; }
  };
  S.tier = function(unlocked){ return unlocked ? S.QUIZ : S.REGULAR; };

  // monta o link da Hotmart repassando oferta, e-mail e origem do anúncio
  S.checkoutUrl = function(opts){
    var qs = opts.qs, url = new URL(S.CHECKOUT), t = S.tier(opts.unlocked);
    if (t.offer) url.searchParams.set('off', t.offer);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){
      if (qs.get(k)) url.searchParams.set(k, qs.get(k));
    });
    var src = [qs.get('utm_campaign'), qs.get('utm_content'), opts.variant].filter(Boolean).join('|');
    if (src) url.searchParams.set('src', src);
    if (opts.email) url.searchParams.set('email', opts.email);
    return url.toString();
  };

  // escapa texto dos depoimentos antes de pôr no HTML
  var esc = function(s){ return String(s || '').replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  S.renderTestimonios = function(container, section){
    if (!container) return;
    if (!S.TESTIMONIOS.length) { if (section) section.hidden = true; return; }
    container.innerHTML = S.TESTIMONIOS.map(function(t){
      return '<figure class="t">' +
        (t.img ? '<img src="' + esc(t.img) + '" alt="Mensaje de ' + esc(t.nombre) + '" loading="lazy">' : '') +
        (t.texto ? '<blockquote>“' + esc(t.texto) + '”</blockquote>' : '') +
        '<figcaption>' + esc(t.nombre) + (t.pais ? ' · ' + esc(t.pais) : '') + '</figcaption></figure>';
    }).join('');
    if (section) section.hidden = false;
  };
})(window.SALOMON);
