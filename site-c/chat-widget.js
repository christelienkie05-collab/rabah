// ═══════════════════════════════════════════════════════════════
// LYRA MUSIC — Assistant IA intégré
// S'auto-injecte sur toutes les pages via <script src="chat-widget.js">
// ═══════════════════════════════════════════════════════════════
(function () {
  // ── CSS ──────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
  #lm-chat-bubble{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#8B5E28);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 24px rgba(201,168,76,0.4);transition:transform .2s,box-shadow .2s}
  #lm-chat-bubble:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(201,168,76,0.55)}
  #lm-chat-bubble .lm-notif{position:absolute;top:0;right:0;width:16px;height:16px;background:#e05555;border-radius:50%;border:2px solid #0D0D0D;font-size:9px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
  #lm-chat-window{position:fixed;bottom:92px;right:24px;z-index:9998;width:360px;max-height:560px;background:#151515;border:1px solid rgba(201,168,76,0.25);border-radius:20px;display:flex;flex-direction:column;box-shadow:0 8px 48px rgba(0,0,0,0.6);overflow:hidden;transition:opacity .2s,transform .2s;opacity:0;pointer-events:none;transform:translateY(12px) scale(.97)}
  #lm-chat-window.open{opacity:1;pointer-events:all;transform:translateY(0) scale(1)}
  .lm-header{background:linear-gradient(135deg,#1a1000,#1E1E1E);border-bottom:1px solid rgba(201,168,76,0.2);padding:16px 18px;display:flex;align-items:center;gap:12px}
  .lm-header-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#8B5E28);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .lm-header-body{flex:1}
  .lm-header-name{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:#F0EDE6}
  .lm-header-status{font-size:11px;color:#4caf7d;display:flex;align-items:center;gap:4px}
  .lm-header-status::before{content:'';width:6px;height:6px;background:#4caf7d;border-radius:50%;flex-shrink:0}
  .lm-close{background:none;border:none;color:#8A8478;font-size:18px;cursor:pointer;padding:4px;line-height:1;transition:color .2s}
  .lm-close:hover{color:#F0EDE6}
  .lm-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;max-height:360px}
  .lm-messages::-webkit-scrollbar{width:4px}.lm-messages::-webkit-scrollbar-track{background:transparent}.lm-messages::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.2);border-radius:2px}
  .lm-msg{max-width:88%;font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.55;padding:10px 14px;border-radius:14px;animation:lmFade .2s ease}
  @keyframes lmFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .lm-msg.bot{background:#1E1E1E;color:#F0EDE6;border-bottom-left-radius:4px;align-self:flex-start}
  .lm-msg.user{background:linear-gradient(135deg,#C9A84C,#a07830);color:#0D0D0D;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}
  .lm-msg strong{color:#C9A84C;font-weight:600}
  .lm-msg a{color:#C9A84C;text-decoration:underline}
  .lm-suggestions{padding:0 16px 10px;display:flex;flex-wrap:wrap;gap:6px}
  .lm-sugg-btn{background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);color:#C9A84C;border-radius:100px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap}
  .lm-sugg-btn:hover{background:rgba(201,168,76,0.2);border-color:rgba(201,168,76,0.6)}
  .lm-typing{display:flex;align-items:center;gap:5px;padding:10px 14px;background:#1E1E1E;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;width:fit-content}
  .lm-typing span{width:6px;height:6px;background:#8A8478;border-radius:50%;animation:lmDot 1.2s infinite}
  .lm-typing span:nth-child(2){animation-delay:.2s}.lm-typing span:nth-child(3){animation-delay:.4s}
  @keyframes lmDot{0%,80%,100%{transform:scale(1);opacity:.5}40%{transform:scale(1.2);opacity:1}}
  .lm-input-row{border-top:1px solid rgba(201,168,76,0.15);padding:12px;display:flex;gap:8px;align-items:center}
  .lm-input{flex:1;background:#0D0D0D;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:9px 14px;color:#F0EDE6;font-size:13px;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .2s}
  .lm-input:focus{border-color:rgba(201,168,76,0.5)}
  .lm-input::placeholder{color:#8A8478}
  .lm-send{background:#C9A84C;color:#0D0D0D;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:background .2s}
  .lm-send:hover{background:#E8C96A}
  @media(max-width:420px){#lm-chat-window{width:calc(100vw - 32px);right:16px;bottom:88px}#lm-chat-bubble{right:16px;bottom:16px}}
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────
  const container = document.createElement('div');
  container.innerHTML = `
  <button id="lm-chat-bubble" onclick="lmToggle()" aria-label="Assistant Lyra Music">
    🎵
    <span class="lm-notif" id="lm-notif">1</span>
  </button>
  <div id="lm-chat-window">
    <div class="lm-header">
      <div class="lm-header-av">🎵</div>
      <div class="lm-header-body">
        <div class="lm-header-name">Assistant Lyra Music</div>
        <div class="lm-header-status">En ligne · répond en quelques secondes</div>
      </div>
      <button class="lm-close" onclick="lmToggle()">✕</button>
    </div>
    <div class="lm-messages" id="lm-messages"></div>
    <div class="lm-suggestions" id="lm-suggestions"></div>
    <div class="lm-input-row">
      <input class="lm-input" id="lm-input" placeholder="Posez votre question…" onkeydown="if(event.key==='Enter')lmSend()">
      <button class="lm-send" onclick="lmSend()">➤</button>
    </div>
  </div>`;
  document.body.appendChild(container);

  // ── BASE DE CONNAISSANCES ────────────────────────────────────
  const KB = [
    {
      triggers: ['bonjour','salut','hello','bonsoir','bjr','coucou','bsr','yo'],
      response: `Bonjour ! 👋 Je suis l'assistant IA de Lyra Music.\n\nJe peux vous aider sur :\n• 🎵 Trouver un musicien\n• 📅 Publier une annonce\n• 🛒 Boutique instruments\n• 💳 Paiement & sécurité\n• ✨ Service conciergerie\n• 🚀 Booster votre profil\n\nQue puis-je faire pour vous ?`,
      suggestions: ['Trouver un musicien','Publier une annonce','Comment payer ?','C\'est quoi la conciergerie ?']
    },
    {
      triggers: ['trouver','chercher','musicien','pianiste','guitariste','chanteur','violoniste','saxophoniste','batteur','talent','profil','artiste'],
      response: `Pour trouver un musicien :\n\n1. Rendez-vous sur **Musiciens**\n2. Filtrez par instrument (piano, guitare, chant…)\n3. Cherchez par ville ou utilisez **📍 Autour de moi**\n4. Cliquez sur une carte pour voir le profil vidéo complet\n5. Cliquez **"Voir les coordonnées"** pour le contacter directement\n\nTous les profils sont vérifiés par notre équipe.`,
      suggestions: ['Comment contacter un musicien ?','Comment payer ?','C\'est quoi la conciergerie ?']
    },
    {
      triggers: ['publier','annonce','mission','poster','cherche','besoin','événement','mariage','église','gala','concert'],
      response: `Pour publier une annonce :\n\n1. Allez sur **Événements**\n2. Cliquez **"+ Publier une annonce"**\n3. Remplissez le formulaire (type, date, ville, budget, instruments souhaités)\n4. Envoyez via **WhatsApp** — votre annonce est publiée en quelques heures\n\n📣 Vous pouvez aussi la **mettre en avant pour 5€** pour recevoir des candidatures plus vite.`,
      suggestions: ['Mettre en avant mon annonce','Comment payer ?','C\'est quoi la conciergerie ?']
    },
    {
      triggers: ['payer','paiement','prix','coût','tarif','combien','argent','sécurisé','sécurité','stripe'],
      response: `💳 **Comment ça marche :**\n\nLyra Music utilise **Stripe** (le système de paiement le plus sécurisé du monde).\n\n① Vous payez → l'argent est bloqué en **séquestre** chez Stripe\n② L'événement a lieu et le musicien confirme\n③ **48h après** → l'argent est libéré automatiquement au musicien\n\nEn cas de problème → **remboursement intégral garanti**. Lyra perçoit 10% de commission sur chaque transaction.`,
      suggestions: ['C\'est quoi l\'escrow ?','La commission de 10% ?','Conciergerie tarifs']
    },
    {
      triggers: ['escrow','séquestre','bloqué','retenu'],
      response: `🔒 **L'escrow Stripe, c'est quoi ?**\n\nC'est un compte séquestre : votre argent est **ni chez vous, ni chez le musicien** — il est chez Stripe en sécurité.\n\nIl n'est libéré au musicien que si l'événement s'est bien passé. Si le musicien ne vient pas ou si vous signalez un problème dans les 48h → **remboursement total automatique**.\n\nC'est comme une main tierce de confiance entre vous et le musicien.`,
      suggestions: ['Combien coûte la commission ?','Conciergerie','Trouver un musicien']
    },
    {
      triggers: ['commission','10%','frais','plateforme'],
      response: `Lyra Music perçoit **10% de commission** sur chaque réservation payée.\n\nExemple :\n• Organisateur paie 200€\n• Musicien reçoit **180€**\n• Lyra perçoit **20€** automatiquement via Stripe\n\nCette commission finance la plateforme, la vérification des profils, et le support. Elle est prélevée automatiquement, vous n'avez rien à calculer.`,
      suggestions: ['Comment payer ?','Trouver un musicien','Booster mon profil']
    },
    {
      triggers: ['conciergerie','on cherche','vous cherchez','chercher pour moi','s\'en charge','gérez'],
      response: `✨ **Service Conciergerie** — on s'occupe de tout à votre place :\n\n🥇 **Essentiel — 290€**\n1 musicien, vérification complète, coordination\n\n👑 **Prestige — 590€** *(le plus demandé)*\n2 à 4 musiciens, chef de projet dédié, fiche technique\n\n💎 **Excellence — 990€**\nGroupe complet 5-8 musiciens, 2 répétitions, présence le jour J\n\nContactez-nous sur WhatsApp pour démarrer.`,
      suggestions: ['Contacter pour la conciergerie','Comment payer ?','Trouver un musicien seul']
    },
    {
      triggers: ['boost','booster','avancer','premier','visible','visibilité','mettre en avant','apparaître'],
      response: `🚀 **Booster votre profil musicien :**\n\n• **5€ / 1 semaine** — idéal pour tester\n• **15€ / 1 mois** — le plus rentable *(recommandé)*\n• **35€ / 3 mois** — visibilité continue + badge ⭐\n\n**Booster une annonce :** 5€ / 7 jours\n\nActivation sous 2h après paiement. Annulable à tout moment. Payez via WhatsApp.`,
      suggestions: ['Contacter pour booster','Comment payer ?','Publier une annonce']
    },
    {
      triggers: ['boutique','instrument','acheter','commander','piano','guitare','batterie','micro','shure','yamaha','roland','fender','thomann'],
      response: `🛒 **La boutique Lyra Music** propose 16+ instruments sélectionnés pour les musiciens gospel :\n\n🎹 Pianos — Yamaha P-145, Roland FP-30X, Korg B2\n🎸 Guitares — Fender Stratocaster, Squier, Yamaha FG800\n🥁 Batteries — Roland TD-07DMK, Alesis Nitro\n🎤 Micros — Shure SM58, Sennheiser e835, Behringer\n\nEn cliquant "Acheter", vous êtes redirigé chez Thomann, Bax Music, Amazon ou Woodbrass. Livraison 2 à 5 jours.`,
      suggestions: ['Meilleur piano pour l\'église ?','Livraison boutique ?','Retours boutique ?']
    },
    {
      triggers: ['livraison','délai','expédition','recevoir','quand'],
      response: `📦 **Livraison via nos partenaires :**\n\n• **Thomann** — 2 à 5 jours ouvrés, depuis l'Allemagne\n• **Bax Music** — 2 à 4 jours, depuis les Pays-Bas\n• **Amazon FR** — 1 à 2 jours (Prime)\n• **Woodbrass** — 3 à 5 jours, depuis la France\n\nTous offrent la livraison gratuite au-delà d'un seuil. Les frais exacts sont affichés sur leur site au moment de la commande.`,
      suggestions: ['Politique de retour ?','Quel piano choisir ?','Contacter le support']
    },
    {
      triggers: ['retour','rembours','satisfait','echanger','échange'],
      response: `↩️ **Politique de retour :**\n\n• **Thomann** — 30 jours satisfait ou remboursé\n• **Bax Music** — 30 jours, retour gratuit\n• **Amazon FR** — 30 jours\n• **Woodbrass** — 14 jours selon CGV\n\nLes retours se font directement auprès du marchand chez qui vous avez commandé. Conservez votre bon de commande.`,
      suggestions: ['Commander dans la boutique','Quel micro choisir ?','Contacter le support']
    },
    {
      triggers: ['piano','clavier','touche','numérique'],
      response: `🎹 **Quel piano choisir pour l'église ?**\n\n• **Débutant / budget serré** → **Korg B2** (459€) — 88 touches, son de qualité\n• **Intermédiaire** → **Yamaha P-145** (599€) — le standard des musiciens gospel\n• **Avancé / gigging** → **Roland FP-30X** (749€) — son SuperNATURAL, toucher professionnel\n\nTous disponibles dans notre **boutique** avec livraison rapide.`,
      suggestions: ['Voir la boutique','Acheter le Yamaha P-145','Conciergerie instruments']
    },
    {
      triggers: ['micro','voix','chant','vocal','sm58'],
      response: `🎤 **Quel micro pour le gospel ?**\n\n• **Entrée de gamme** → **Behringer XM8500** (24€) — idéal pour l'église, répétitions\n• **Référence** → **Shure SM58** (99€) — le standard mondial, dure des décennies\n• **Qualité** → **Sennheiser e835** (89€) — excellent rejet du bruit, son chaud\n• **In-ear monitoring** → **Shure SE215** (114€) — indispensable sur scène\n\nDisponibles dans notre boutique.`,
      suggestions: ['Voir la boutique','Quel piano choisir ?','Contacter le support']
    },
    {
      triggers: ['inscrire','inscription','compte','créer','s\'enregistrer','rejoindre','devenir'],
      response: `📝 **Comment s'inscrire sur Lyra Music :**\n\n**En tant que musicien :**\nContactez-nous sur WhatsApp en cliquant "Créer mon profil" sur la page Musiciens. Nous créons votre profil avec vos infos, bio et vidéos.\n\n**En tant qu'organisateur :**\nAucune inscription requise — publiez une annonce directement sur la page Événements.\n\nL'inscription musicien est **totalement gratuite**.`,
      suggestions: ['Booster mon profil','Publier une annonce','Conciergerie']
    },
    {
      triggers: ['contact','joindre','support','aide','problème','erreur','bug','signaler'],
      response: `📞 **Nous contacter :**\n\n• **WhatsApp** → wa.me/33651426961 *(réponse sous 2h)*\n• **Email** → levitiquepianoschool@gmail.com\n• **Instagram** → @levitique_piano_school\n\nPour les urgences (événement imminent, problème de paiement) → **WhatsApp uniquement**.`,
      suggestions: ['Conciergerie','Booster mon profil','Trouver un musicien']
    },
    {
      triggers: ['affiliation','thomann','awin','commission boutique','gagner','revenu','affilié'],
      response: `💰 **Affiliation Thomann :**\n\n1. Créez un compte sur **awin.com**\n2. Rejoignez le programme **Thomann** (advertiser ID: 19936)\n3. Rejoignez **Bax Music** (Awin) et **Gear4music** (Awin)\n4. Renseignez votre Awin ID dans le code boutique\n\nTous les liens deviennent affiliés automatiquement. Commission : **3,5 à 6%** par vente.\n\nAmazon Associates : inscrivez-vous sur affiliate-program.amazon.fr`,
      suggestions: ['Voir la boutique','Booster profil','Conciergerie']
    },
    {
      triggers: ['merci','super','parfait','génial','cool','ok','d\'accord','compris'],
      response: `Avec plaisir ! 🙏 N'hésitez pas si vous avez d'autres questions. Bénédiction sur votre événement ! 🎵`,
      suggestions: ['Trouver un musicien','Voir la boutique','Conciergerie']
    }
  ];

  const DEFAULT = {
    response: `Je n'ai pas tout compris 😅 Voici ce que je peux vous expliquer :\n\n• 🎵 Trouver / contacter un musicien\n• 📅 Publier une annonce\n• 💳 Fonctionnement du paiement\n• ✨ Service conciergerie\n• 🛒 Boutique instruments\n• 🚀 Booster un profil\n\nOu contactez-nous directement sur <a href="https://wa.me/33651426961" target="_blank">WhatsApp</a>.`,
    suggestions: ['Trouver un musicien','Comment payer ?','Conciergerie','Contacter le support']
  };

  // ── ÉTAT ─────────────────────────────────────────────────────
  let isOpen = false;
  let firstOpen = true;

  // ── FONCTIONS ─────────────────────────────────────────────────
  window.lmToggle = function () {
    isOpen = !isOpen;
    const win = document.getElementById('lm-chat-window');
    const notif = document.getElementById('lm-notif');
    win.classList.toggle('open', isOpen);
    if (isOpen) {
      notif.style.display = 'none';
      document.getElementById('lm-input').focus();
      if (firstOpen) {
        firstOpen = false;
        setTimeout(() => lmBotReply(KB[0].response, KB[0].suggestions), 500);
      }
    }
  };

  window.lmSend = function () {
    const input = document.getElementById('lm-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    lmAddMsg(text, 'user');
    document.getElementById('lm-suggestions').innerHTML = '';
    const typing = lmShowTyping();
    setTimeout(() => {
      typing.remove();
      const match = findAnswer(text);
      lmBotReply(match.response, match.suggestions);
    }, 700 + Math.random() * 400);
  };

  function findAnswer(text) {
    const t = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[?!.,;:]/g, '');
    for (const entry of KB) {
      if (entry.triggers.some(kw => t.includes(kw))) return entry;
    }
    return DEFAULT;
  }

  function lmAddMsg(text, who) {
    const msgs = document.getElementById('lm-messages');
    const div = document.createElement('div');
    div.className = 'lm-msg ' + who;
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function lmShowTyping() {
    const msgs = document.getElementById('lm-messages');
    const div = document.createElement('div');
    div.className = 'lm-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function lmBotReply(text, suggestions) {
    lmAddMsg(text, 'bot');
    if (suggestions && suggestions.length) {
      const sugg = document.getElementById('lm-suggestions');
      sugg.innerHTML = suggestions.map(s =>
        `<button class="lm-sugg-btn" onclick="lmQuick('${s.replace(/'/g, "\\'")}')">` + s + `</button>`
      ).join('');
    }
  }

  window.lmQuick = function (text) {
    document.getElementById('lm-input').value = text;
    lmSend();
  };

  // ── MESSAGE DE BIENVENUE APRÈS 3 SECONDES ─────────────────────
  setTimeout(() => {
    const notif = document.getElementById('lm-notif');
    if (!isOpen) notif.style.display = 'flex';
  }, 3000);

})();
