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

// Переключатель темы
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Уведомление
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

// Рендер моего списка
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

// Создание элемента списка
function createWishItemElement(item, withEditDelete = false, showAddButton = false) {
    const li = document.createElement('li');
    li.className = 'wish-item';
    li.dataset.id = item.id;

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

    // Блок с кнопками (для своих элементов)
    if (withEditDelete) {
        const btnGroup = document.createElement('div');
        btnGroup.className = 'item-buttons';

        // Кнопка редактирования
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.setAttribute('aria-label', 'Edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startEditing(li, item);
        });

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.setAttribute('aria-label', 'Delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeItemWithAnimation(li, item.id);
        });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);
        li.appendChild(btnGroup);
    }

    // Для чужого списка только кнопка добавления
    if (showAddButton) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.setAttribute('aria-label', 'Add to my list');
        addBtn.dataset.title = item.title;
        addBtn.dataset.url = item.url || '';
        li.appendChild(addBtn);
    }

    return li;
}

// Режим редактирования (увеличенные поля)
function startEditing(li, item) {
    const currentTitle = item.title;
    const currentUrl = item.url || '';

    li.innerHTML = '';
    li.style.padding = '20px 25px';
    li.style.flexDirection = 'column';
    li.style.alignItems = 'stretch';

    const titleInputEdit = document.createElement('input');
    titleInputEdit.type = 'text';
    titleInputEdit.value = currentTitle;
    titleInputEdit.placeholder = 'Title';
    titleInputEdit.style.marginBottom = '12px';
    titleInputEdit.style.padding = '12px 16px';
    titleInputEdit.style.fontSize = '1.1rem';
    titleInputEdit.style.border = '1px solid var(--border)';
    titleInputEdit.style.borderRadius = '30px';
    titleInputEdit.style.background = 'var(--surface)';
    titleInputEdit.style.color = 'var(--text)';
    titleInputEdit.style.outline = 'none';
    titleInputEdit.style.transition = 'border 0.2s';
    titleInputEdit.addEventListener('focus', (e) => e.target.style.borderColor = 'var(--accent)');
    titleInputEdit.addEventListener('blur', (e) => e.target.style.borderColor = 'var(--border)');

    const urlInputEdit = document.createElement('input');
    urlInputEdit.type = 'url';
    urlInputEdit.value = currentUrl;
    urlInputEdit.placeholder = 'Link (optional)';
    urlInputEdit.style.marginBottom = '15px';
    urlInputEdit.style.padding = '12px 16px';
    urlInputEdit.style.fontSize = '1.1rem';
    urlInputEdit.style.border = '1px solid var(--border)';
    urlInputEdit.style.borderRadius = '30px';
    urlInputEdit.style.background = 'var(--surface)';
    urlInputEdit.style.color = 'var(--text)';
    urlInputEdit.style.outline = 'none';
    urlInputEdit.style.transition = 'border 0.2s';
    urlInputEdit.addEventListener('focus', (e) => e.target.style.borderColor = 'var(--accent)');
    urlInputEdit.addEventListener('blur', (e) => e.target.style.borderColor = 'var(--border)');

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '12px';
    btnGroup.style.justifyContent = 'flex-end';

    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = 'Save';
    saveBtn.style.padding = '10px 24px';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '40px';
    saveBtn.style.background = 'var(--gradient)';
    saveBtn.style.color = 'white';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.fontWeight = '600';
    saveBtn.style.fontSize = '1rem';
    saveBtn.style.transition = 'transform 0.2s';
    saveBtn.addEventListener('mouseenter', () => saveBtn.style.transform = 'scale(1.05)');
    saveBtn.addEventListener('mouseleave', () => saveBtn.style.transform = 'scale(1)');
    saveBtn.addEventListener('click', () => {
        const newTitle = titleInputEdit.value.trim();
        if (!newTitle) return;
        const newUrl = urlInputEdit.value.trim() || null;

        const index = myWishlist.findIndex(i => i.id === item.id);
        if (index !== -1) {
            myWishlist[index] = { ...item, title: newTitle, url: newUrl };
            saveMyList();
        }
        renderMyList();
        showMessage('Saved');
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.style.padding = '10px 24px';
    cancelBtn.style.border = '1px solid var(--border)';
    cancelBtn.style.borderRadius = '40px';
    cancelBtn.style.background = 'transparent';
    cancelBtn.style.color = 'var(--text-muted)';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontWeight = '500';
    cancelBtn.style.fontSize = '1rem';
    cancelBtn.style.transition = 'all 0.2s';
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'var(--accent)';
        cancelBtn.style.color = 'var(--surface)';
        cancelBtn.style.borderColor = 'var(--accent)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = 'var(--text-muted)';
        cancelBtn.style.borderColor = 'var(--border)';
    });
    cancelBtn.addEventListener('click', () => {
        renderMyList();
    });

    btnGroup.appendChild(saveBtn);
    btnGroup.appendChild(cancelBtn);

    li.appendChild(titleInputEdit);
    li.appendChild(urlInputEdit);
    li.appendChild(btnGroup);
}

// Удаление с анимацией
function removeItemWithAnimation(li, id) {
    li.classList.add('removing');
    setTimeout(() => {
        myWishlist = myWishlist.filter(i => i.id !== id);
        saveMyList();
        renderMyList();
        showMessage('Removed from my list');
    }, 200);
}

// Добавление нового желания
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
    showMessage('Added to my list');
});

// Поделиться
shareBtn.addEventListener('click', async () => {
    if (myWishlist.length === 0) {
        showMessage('List is empty, nothing to share', 1500);
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

// PDF (без изменений, но текст уже английский)
pdfBtn.addEventListener('click', () => {
    if (myWishlist.length === 0) {
        showMessage('Nothing to export', 1500);
        return;
    }

    try {
        const isDark = document.body.classList.contains('dark-theme');
        const accentColor = isDark ? '#B8A2D4' : '#B48EAD';
        const textColor = isDark ? '#E5E9F0' : '#2D2A3A';
        const borderColor = isDark ? '#374151' : '#E8D9E4';
        const evenRowColor = isDark ? '#1F2937' : '#F9F4F0';

        // Формируем таблицу: первая колонка автоматической ширины, вторая занимает остаток
        const tableBody = [
            ['Title', 'Link']
        ];

        myWishlist.forEach(item => {
            let linkCell = '—';
            if (item.url) {
                let url = item.url;
                if (!url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }
                // Для длинных ссылок включён перенос
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
            pageMargins: [40, 50, 40, 60],
            content: [
                // Заголовок без эмодзи, только текст
                { text: 'My Wishlist', style: 'header', margin: [0, 0, 0, 10] },
                { text: `Generated: ${new Date().toLocaleDateString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*'], // первая по ширине содержимого, вторая занимает остаток
                        body: tableBody,
                    },
                    layout: {
                        fillColor: function(rowIndex) {
                            if (rowIndex === 0) return accentColor;
                            return (rowIndex % 2 === 0) ? evenRowColor : null;
                        },
                        hLineColor: function() { return borderColor; },
                        vLineColor: function() { return borderColor; },
                        paddingTop: function() { return 6; },
                        paddingBottom: function() { return 6; },
                        paddingLeft: function() { return 8; },
                        paddingRight: function() { return 8; }
                    }
                },
                { text: ' ', margin: [0, 20, 0, 0] },
                { text: 'Online version:', style: 'label' },
                { text: shareUrl.toString(), link: shareUrl.toString(), color: accentColor, decoration: 'underline', margin: [0, 5, 0, 20], fontSize: 9 },
                { text: 'Created with Wishlist App', style: 'footer' }
            ],
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                    color: accentColor,
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 11,
                    color: textColor,
                    alignment: 'center'
                },
                label: {
                    fontSize: 10,
                    bold: true,
                    color: textColor
                },
                footer: {
                    fontSize: 9,
                    color: textColor,
                    alignment: 'center',
                    italics: true
                }
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 9,
                color: textColor
            }
        };

        pdfMake.createPdf(docDefinition).download(`wishlist-${new Date().toISOString().slice(0, 10)}.pdf`);
        showMessage('PDF saved');
    } catch (error) {
        console.error('PDF generation error:', error);
        showMessage('Error creating PDF', 3000);
    }
});

// Просмотр чужого списка
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

// Добавление из чужого списка
sharedListContainer.addEventListener('click', (e) => {
    const addButton = e.target.closest('.add-btn');
    if (!addButton) return;

    const title = addButton.dataset.title;
    const url = addButton.dataset.url || null;

    if (!title) return;

    const newItem = {
        id: Date.now(),
        title: title,
        url: url
    };

    myWishlist.push(newItem);
    saveMyList();
    renderMyList();
    showMessage('Added to your list');
});

// Закрыть просмотр
closeSharedBtn.addEventListener('click', () => {
    sharedSection.style.display = 'none';
    window.location.hash = '';
});

// Проверка хэша при загрузке
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

// Переключатель темы
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

// Сворачивание списков
const collapseButtons = document.querySelectorAll('.collapse-btn');
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

// Первоначальная отрисовка
renderMyList();