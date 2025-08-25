// Load matchup data and render the page
fetch('assets/data/matchups.json')
  .then(response => response.json())
  .then(data => {
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    const champ = getQueryParam('champ');
    const matchupData = data.matchups[champ] || data.matchups['Amumu'];
    const runesets = matchupData.runesets || [];
    let selectedRuneset = 0;

    // Set background image once when page loads
    document.querySelector('.container').style.backgroundImage = `linear-gradient(rgba(18,18,22,0.82), rgba(18,18,22,0.82)), url('${matchupData.splash}')`;

    function renderRunesetTabs() {
      if (runesets.length <= 1) return '';
      return `<div class="runeset-tabs">${runesets.map((r, i) => `<button class="runeset-tab${i === selectedRuneset ? ' active' : ''}" data-idx="${i}">${r.label}</button>`).join('')}</div>`;
    }

    function renderRunesetContent(idx) {
      const r = runesets[idx];
      
      // Resolve runes and items from the data objects
      const resolveRune = (runeKey) => data.runes[runeKey] || { src: '', alt: '', class: '' };
      const resolveItem = (itemKey) => data.items[itemKey] || { src: '', alt: '', price: null };
      
      return `
        <div class="runes-items-merged-container">
          <div class="runes-items-flex">
            <div class="runes-container compact-runes">
              <div class="lee-keystone-row" style="display:flex; flex-direction:column; align-items:center;">
                <img src='${resolveRune(r.primary[0]).src}' alt='${resolveRune(r.primary[0]).alt}' class='${resolveRune(r.primary[0]).class}'>
                <div class="runes-row-sidebyside" style="display:flex; flex-direction:row; gap:2.2rem; margin-top:1.1rem;">
                  <div class="lee-primary-col">
                    ${r.primary.slice(1).map(rn => {
                      const rune = resolveRune(rn);
                      return `<img src='${rune.src}' alt='${rune.alt}' class='${rune.class}'>`;
                    }).join('')}
                  </div>
                  <div class="lee-secondary-col">
                    ${r.secondary.map(rn => {
                      const rune = resolveRune(rn);
                      return `<img src='${rune.src}' alt='${rune.alt}' class='${rune.class}'>`;
                    }).join('')}
                  </div>
                </div>
                <div class="lee-shards-flex runes-shards-centered" style="margin-top:1.2rem; justify-content:center;">
                  ${r.shards.map(rn => {
                    const rune = resolveRune(rn);
                    return `<img src='${rune.src}' alt='${rune.alt}' class='${rune.class}'>`;
                  }).join('')}
                </div>
              </div>
            </div>
            <div class="divider-vertical"></div>
            <div class="items-col compact-items">
              <div class="item-group">
                <div class="item-group-label">Core</div>
                <div class="item-row">
                  ${r.coreItems.map(i => {
                    const item = resolveItem(i);
                    return `
                      <div class='item-with-price'>
                        <img src='${item.src}' alt='${item.alt}' class='item-icon'>
                        <div class='item-price'>${item.price || 'N/A'}</div>
                      </div>`;
                  }).join('')}
                </div>
              </div>
              <div class="item-group">
                <div class="item-group-label">Adaptive</div>
                <div class="item-row">
                  ${r.adaptiveItems.map(i => {
                    const item = resolveItem(i);
                    return `
                      <div class='item-with-price'>
                        <img src='${item.src}' alt='${item.alt}' class='item-icon'>
                        <div class='item-price'>${item.price || 'N/A'}</div>
                      </div>`;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="explanation-row compact-explanation">
          <div class="lee-rune-explanation">
            <h3>Why these runes & items?</h3>
            <p>${r.explanation}</p>
          </div>
        </div>
      `;
    }

    function renderPage() {
      document.getElementById('matchup-content').innerHTML = `
        <div class="champion-detail-content center-content">
          <div class="left-align">
            <img src="${matchupData.portrait}" alt="${matchupData.name}" class="champion-portrait-detail">
            <h1>
              ${matchupData.name}
              ${matchupData.difficulty ? `
                <span class="difficulty-badge difficulty-${matchupData.difficulty.toLowerCase()}">
                  ${matchupData.difficulty}
                </span>
              ` : ''}
            </h1>
          </div>
          ${renderRunesetTabs()}
          <div id="runeset-content">${renderRunesetContent(selectedRuneset)}</div>
          <div class="tips-container">
            <h2>Tips</h2>
            ${formatTips(matchupData.tips)}
          </div>
        </div>
      `;
      // Add event listeners for runeset tabs
      document.querySelectorAll('.runeset-tab').forEach(btn => {
        btn.addEventListener('click', e => {
          selectedRuneset = parseInt(btn.getAttribute('data-idx'));
          document.querySelectorAll('.runeset-tab').forEach((b, i) => b.classList.toggle('active', i === selectedRuneset));
          document.getElementById('runeset-content').innerHTML = renderRunesetContent(selectedRuneset);
        });
      });
    }

    function formatTips(tips) {
      let html = '';
      let inList = false;
      tips.forEach((tip, i) => {
        // Section headers: end with ':' and not a list item
        if (/^(Volibear|Game Plan|Early Game|Mid Game|Late Game|Skill Order Tip|Important Mechanics|Volibear's Advantages|Volibear's Advantages):$/i.test(tip.trim())) {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<strong style="color:#ffe082;display:block;margin-top:1.1em;">${tip.replace(/:$/, '')}</strong>`;
        } else if (tip.trim().startsWith('- ')) {
          if (!inList) { html += '<ul style="margin:0.5em 0 0.5em 1.2em;">'; inList = true; }
          html += `<li>${tip.replace(/^- /, '')}</li>`;
        } else if (tip.trim() === '') {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<br/>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<p style="margin:0.5em 0;">${tip}</p>`;
        }
      });
      if (inList) html += '</ul>';
      return html;
    }

    renderPage();
  }); 