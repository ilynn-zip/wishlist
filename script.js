let myWishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];

const form = document.getElementById('wish-form');
const titleInput = document.getElementById('wish-title');
const urlInput = document.getElementById('wish-url');
const myListContainer = document.getElementById('wish-list');

const shareBtn = document.getElementById('share-btn');
const pdfBtn = document.getElementById('pdf-btn');

const sharedSection = document.getElementById('shared-section');
const sharedListContainer = document.getElementById('shared-list');
const closeSharedBtn = document.getElementById('close-shared');

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

const collapseButtons = document.querySelectorAll('.collapse-btn');

const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

function showMessage(text, duration = 2000) {
    notification.textContent = text;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), duration);
}

function saveMyList() {
    localStorage.setItem('myWishlist', JSON.stringify(myWishlist));
}

function removeItemWithAnimation(item, id) {
    item.classList.add('removing');
    setTimeout(() => {
        myWishlist = myWishlist.filter(i => i.id !== id);
        saveMyList();
        renderMyList();
        showMessage('Removed from your wishlist');
    }, 200);
}

function renderMyList() {
    myListContainer.innerHTML = '';

    if (myWishlist.length === 0) {
        myListContainer.innerHTML = '<li style="text-align:center; color: var(--text-muted); padding:20px;">Your wishlist is empty. Add something!</li>';
        return;
    }

    myWishlist.forEach(item => {
        const li = createWishItemElement(item, true, false);
        myListContainer.appendChild(li);
    });
}

function createWishItemElement(item, withDelete = false, showAddButton = false) {
    const li = document.createElement('li');
    li.className = 'wish-item';

    if (showAddButton) {
        li.dataset.title = item.title;
        li.dataset.url = item.url || '';
    }
    if (withDelete) {
        li.dataset.id = item.id;
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'wish-info';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'wish-title';
    titleDiv.textContent = item.title;
    infoDiv.appendChild(titleDiv);

    if (item.url) {
        const linkA = document.createElement('a');
        linkA.href = item.url;
        linkA.target = '_blank';
        linkA.rel = 'noopener noreferrer';
        linkA.className = 'wish-link';
        linkA.innerHTML = `<i class="fas fa-link"></i> ${item.url.length > 40 ? item.url.slice(0, 40) + '…' : item.url}`;
        infoDiv.appendChild(linkA);
    }

    li.appendChild(infoDiv);

    if (withDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.setAttribute('aria-label', 'Delete');
        li.appendChild(deleteBtn);
    }

    if (showAddButton) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.setAttribute('aria-label', 'Add to my wishlist');
        li.appendChild(addBtn);
    }

    return li;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    if (!title) return;

    const url = urlInput.value.trim() || null;

    const newItem = {
        id: Date.now(),
        title: title,
        url: url
    };

    myWishlist.push(newItem);
    saveMyList();
    renderMyList();

    titleInput.value = '';
    urlInput.value = '';
    showMessage('Added to your wishlist');
});

myListContainer.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (!deleteButton) return;

    const listItem = deleteButton.closest('.wish-item');
    if (!listItem) return;

    const id = Number(listItem.dataset.id);
    removeItemWithAnimation(listItem, id);
});

shareBtn.addEventListener('click', async () => {
    if (myWishlist.length === 0) {
        showMessage('Your wishlist is empty, nothing to share', 1500);
        return;
    }

    try {
        const dataStr = JSON.stringify(myWishlist);
        const encoded = btoa(unescape(encodeURIComponent(dataStr)));
        const url = new URL(window.location.href);
        url.hash = encoded;

        await navigator.clipboard.writeText(url.toString());
        showMessage('Link copied to clipboard');
    } catch (err) {
        showMessage('Failed to copy link', 2000);
    }
});

pdfBtn.addEventListener('click', () => {
    if (myWishlist.length === 0) {
        showMessage('Nothing to export', 1500);
        return;
    }

    const accentColor = '#B48EAD';
    const textColor = '#2D2A3A';
    const borderColor = '#E8D9E4';
    const bgColor = '#FFFFFF';

    const tableBody = [
        ['Item', 'Link']
    ];

    myWishlist.forEach(item => {
        let url = item.url;
        let linkCell = '—';
        
        if (url) {
            if (!url.match(/^https?:\/\//i)) {
                url = 'https://' + url;
            }
            linkCell = { 
                text: url, 
                link: url, 
                color: accentColor, 
                decoration: 'underline',
                fontSize: 9
            };
        }
        tableBody.push([item.title, linkCell]);
    });

    const shareUrl = new URL(window.location.href);
    if (myWishlist.length > 0) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(myWishlist))));
        shareUrl.hash = encoded;
    }

    const docDefinition = {
        pageMargins: [40, 60, 40, 60],
        content: [
            { text: 'My Wishlist', style: 'header' },
            { text: `Generated: ${new Date().toLocaleDateString()}`, style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*'],
                    body: tableBody,
                },
                layout: {
                    fillColor: function(rowIndex) {
                        return rowIndex === 0 ? accentColor : (rowIndex % 2 === 0 ? bgColor : null);
                    },
                    hLineColor: function() { return borderColor; },
                    vLineColor: function() { return borderColor; },
                    paddingTop: 6,
                    paddingBottom: 6,
                    paddingLeft: 8,
                    paddingRight: 8,
                }
            },
            { text: ' ', margin: [0, 20, 0, 0] },
            { text: 'Online version:', style: 'label' },
            { text: shareUrl.toString(), link: shareUrl.toString(), color: accentColor, decoration: 'underline', margin: [0, 5, 0, 20], fontSize: 10 },
            { text: 'Created with Wishlist App', style: 'footer' }
        ],
        styles: {
            header: { fontSize: 24, bold: true, color: accentColor, margin: [0,0,0,10], alignment: 'center' },
            subheader: { fontSize: 12, color: textColor, margin: [0,0,0,20], alignment: 'center' },
            label: { fontSize: 11, bold: true, color: textColor, margin: [0,10,0,5] },
            footer: { fontSize: 10, color: textColor, margin: [0,20,0,0], alignment: 'center', italics: true }
        },
        defaultStyle: { font: 'Roboto', fontSize: 10, color: textColor }
    };

    pdfMake.createPdf(docDefinition).download(`wishlist-${new Date().toISOString().slice(0, 10)}.pdf`);
    showMessage('PDF saved (light theme, clickable links)');
});

function showSharedWishlist(sharedData) {
    if (!Array.isArray(sharedData) || sharedData.length === 0) {
        sharedSection.style.display = 'none';
        return;
    }

    sharedListContainer.innerHTML = '';
    sharedData.forEach(item => {
        const li = createWishItemElement(item, false, true);
        sharedListContainer.appendChild(li);
    });

    sharedSection.style.display = 'block';
    sharedListContainer.classList.remove('collapsed');
    const sharedCollapseBtn = document.querySelector('.shared-view .collapse-btn i');
    if (sharedCollapseBtn) {
        sharedCollapseBtn.className = 'fas fa-chevron-up';
    }
}

sharedListContainer.addEventListener('click', (e) => {
    const addButton = e.target.closest('.add-btn');
    if (!addButton) return;

    const listItem = addButton.closest('.wish-item');
    if (!listItem) return;

    const title = listItem.dataset.title;
    const url = listItem.dataset.url || null;

    if (!title) return;

    const newItem = {
        id: Date.now(),
        title: title,
        url: url
    };

    myWishlist.push(newItem);
    saveMyList();
    renderMyList();
    showMessage('Added to your wishlist');
});

closeSharedBtn.addEventListener('click', () => {
    sharedSection.style.display = 'none';
    window.location.hash = '';
});

window.addEventListener('load', () => {
    if (window.location.hash && window.location.hash.length > 1) {
        const encoded = window.location.hash.slice(1);
        try {
            const decoded = decodeURIComponent(escape(atob(encoded)));
            const sharedData = JSON.parse(decoded);
            if (Array.isArray(sharedData)) {
                showSharedWishlist(sharedData);
            } else {
                sharedSection.style.display = 'none';
            }
        } catch (e) {
            sharedSection.style.display = 'none';
        }
    } else {
        sharedSection.style.display = 'none';
    }
});

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    setTheme(isDark ? 'light' : 'dark');
});

collapseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        let list;
        if (targetId === 'my-list') {
            list = document.getElementById('wish-list');
        } else if (targetId === 'shared-list') {
            list = document.getElementById('shared-list');
        }
        if (!list) return;

        list.classList.toggle('collapsed');
        btn.classList.toggle('collapsed');
        const icon = btn.querySelector('i');
        if (list.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-down';
        } else {
            icon.className = 'fas fa-chevron-up';
        }
    });
});

renderMyList();