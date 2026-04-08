// tariff-customizer.js - финальная версия
(function() {
    'use strict';

    class TariffCustomizer {
        constructor() {
            this.pinnedTariffs = new Set();
            this.favoriteTariffs = new Set();
            this.vipTariffs = new Set();
            this.superTariffs = new Set();
            this.tariffPositions = {};
            this.draggedItem = null;
            this.dragOverItem = null;
            this.container = null;
            this.mainColumn = null;
            this.favoriteColumn = null;
            this.vipColumn = null;
            this.superColumn = null;
            this.cards = [];
            this.favoriteCards = [];
            this.vipCards = [];
            this.superCards = [];
            this.storageKey = 'tariff_customizer_v3';
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.isUpdating = false;
            this.initialized = false;
            this.dragGhost = null;
            this.observer = null;
            this.updateTimeout = null;
            this.initAttempts = 0;
            this.checkInterval = null;
            this.isRestoring = false;
            this.resizeTimeout = null;
            this.recoveryAttempts = 0;
            this.isDestroying = false;
            this.isHandlingNavigation = false;
            this.lastUrl = '';
            this.navigationTimeout = null;
            this.initDelayTimeout = null;
            this.loadMoreObserver = null;
            this.isLoadingMore = false;
            
            console.log('[TariffCustomizer] ========== ИНИЦИАЛИЗАЦИЯ ==========');
            this.init();
        }

        isExportPauseActive() {
            return window.__tariffExportPauseCustomizer === true || localStorage.getItem('tariff_export_pause_customizer') === '1';
        }

        forceResizeText() {
            const width = window.innerWidth;
            
            let titleSize, descSize, priceSize, dateSize;
            
            if (width <= 2163 && width > 1920) {
                titleSize = '15px';
                descSize = '13px';
                priceSize = '17px';
                dateSize = '10px';
            } else if (width <= 1920 && width > 1600) {
                titleSize = '14px';
                descSize = '12px';
                priceSize = '16px';
                dateSize = '9px';
            } else if (width <= 1600 && width > 1200) {
                titleSize = '13px';
                descSize = '11px';
                priceSize = '15px';
                dateSize = '8px';
            } else if (width <= 1200 && width > 900) {
                titleSize = '12px';
                descSize = '10px';
                priceSize = '14px';
                dateSize = '7px';
            } else if (width <= 900) {
                titleSize = '11px';
                descSize = '9px';
                priceSize = '13px';
                dateSize = '6px';
            } else {
                titleSize = '';
                descSize = '';
                priceSize = '';
                dateSize = '';
            }
            
            const titles = document.querySelectorAll('.css-17i8ct5');
            const descriptions = document.querySelectorAll('.css-1qatje8');
            const prices = document.querySelectorAll('.css-1kn2u3p');
            const dates = document.querySelectorAll('.tariff-date-moved');
            
            if (titleSize) {
                titles.forEach(el => {
                    el.style.setProperty('font-size', titleSize, 'important');
                    el.style.fontSize = titleSize;
                });
            } else {
                titles.forEach(el => el.style.removeProperty('font-size'));
            }
            
            if (descSize) {
                descriptions.forEach(el => {
                    el.style.setProperty('font-size', descSize, 'important');
                    el.style.fontSize = descSize;
                });
            } else {
                descriptions.forEach(el => el.style.removeProperty('font-size'));
            }
            
            if (priceSize) {
                prices.forEach(el => {
                    el.style.setProperty('font-size', priceSize, 'important');
                    el.style.fontSize = priceSize;
                });
            } else {
                prices.forEach(el => el.style.removeProperty('font-size'));
            }
            
            if (dateSize) {
                dates.forEach(el => {
                    el.style.setProperty('font-size', dateSize, 'important');
                    el.style.fontSize = dateSize;
                });
            } else {
                dates.forEach(el => el.style.removeProperty('font-size'));
            }
        }

        injectForceStyles() {
            const oldStyle = document.querySelector('#tariff-force-styles');
            if (oldStyle) oldStyle.remove();
            
            const style = document.createElement('style');
            style.id = 'tariff-force-styles';
            style.textContent = `
                @media (min-width: 2164px) {
                    .tariff-top-columns,
                    .tariff-bottom-columns {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        align-items: stretch !important;
                        gap: 24px !important;
                    }

                    .tariff-top-columns .tariff-column,
                    .tariff-bottom-columns .tariff-column {
                        min-width: 0 !important;
                        box-sizing: border-box !important;
                    }
                }
                
                @media (max-width: 2163px) and (min-width: 1601px) {
                    .tariff-top-columns,
                    .tariff-bottom-columns {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        align-items: stretch !important;
                        gap: 20px !important;
                    }

                    .tariff-top-columns .tariff-column,
                    .tariff-bottom-columns .tariff-column {
                        min-width: 0 !important;
                        box-sizing: border-box !important;
                    }

                    .tariff-column {
                        padding-left: 18px !important;
                        padding-right: 18px !important;
                    }
                }
                
                @media (max-width: 1600px) and (min-width: 1281px) {
                    .tariff-top-columns,
                    .tariff-bottom-columns {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        align-items: stretch !important;
                        gap: 16px !important;
                    }

                    .tariff-top-columns .tariff-column,
                    .tariff-bottom-columns .tariff-column {
                        min-width: 0 !important;
                        box-sizing: border-box !important;
                    }

                    .tariff-column {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                    }
                }
                
                @media (max-width: 1280px) {
                    .tariff-top-columns,
                    .tariff-bottom-columns {
                        display: flex !important;
                        flex-direction: row !important;
                        flex-wrap: nowrap !important;
                        align-items: stretch !important;
                        gap: 12px !important;
                    }

                    .tariff-top-columns .tariff-column,
                    .tariff-bottom-columns .tariff-column {
                        min-width: 0 !important;
                        box-sizing: border-box !important;
                    }

                    .tariff-column {
                        padding-left: 14px !important;
                        padding-right: 14px !important;
                    }
                }
                
                @media (max-width: 2163px) and (min-width: 1921px) {
                    .css-17i8ct5 { font-size: 15px !important; line-height: 1.2 !important; }
                    .css-1qatje8 { font-size: 13px !important; }
                    .css-1kn2u3p { font-size: 17px !important; }
                    .tariff-date-moved { font-size: 10px !important; }
                }
                
                @media (max-width: 1920px) and (min-width: 1601px) {
                    .css-17i8ct5 { font-size: 14px !important; line-height: 1.2 !important; }
                    .css-1qatje8 { font-size: 12px !important; }
                    .css-1kn2u3p { font-size: 16px !important; }
                    .tariff-date-moved { font-size: 9px !important; }
                }
                
                @media (max-width: 1600px) and (min-width: 1201px) {
                    .css-17i8ct5 { font-size: 13px !important; line-height: 1.2 !important; }
                    .css-1qatje8 { font-size: 11px !important; }
                    .css-1kn2u3p { font-size: 15px !important; }
                    .tariff-date-moved { font-size: 8px !important; }
                }
                
                @media (max-width: 1200px) and (min-width: 901px) {
                    .css-17i8ct5 { font-size: 12px !important; line-height: 1.2 !important; }
                    .css-1qatje8 { font-size: 10px !important; }
                    .css-1kn2u3p { font-size: 14px !important; }
                    .tariff-date-moved { font-size: 7px !important; }
                }
                
                @media (max-width: 900px) {
                    .css-17i8ct5 { font-size: 11px !important; line-height: 1.2 !important; }
                    .css-1qatje8 { font-size: 9px !important; }
                    .css-1kn2u3p { font-size: 13px !important; }
                    .tariff-date-moved { font-size: 6px !important; }
                }
            `;
            document.head.appendChild(style);
        }

        injectGlobalStyles() {
            if (document.querySelector('#tariff-customizer-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'tariff-customizer-styles';
            style.textContent = `
                @keyframes tariffFadeIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .tariff-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    width: 100%;
                    margin-top: 20px;
                }
                
                .tariff-top-columns {
                    display: flex;
                    gap: 24px;
                    width: 100%;
                    flex-wrap: nowrap;
                    align-items: stretch;
                }
                
                .tariff-bottom-columns {
                    display: flex;
                    gap: 24px;
                    width: 100%;
                    flex-wrap: nowrap;
                    align-items: stretch;
                }
                
                .tariff-column {
                    flex: 1 1 0;
                    min-width: 0;
                    box-sizing: border-box;
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 20px;
                    padding: 20px;
                    border: 2px dashed #cbd5e1;
                    transition: all 0.3s ease;
                    position: relative;
                    min-height: 200px;
                }
                
                .tariff-column.drag-over-column {
                    border-color: #3b82f6;
                    background: linear-gradient(135deg, #eff6ff, #dbeafe);
                    transform: scale(1.01);
                }
                
                .tariff-column::before {
                    position: absolute;
                    top: -12px;
                    left: 20px;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    z-index: 1;
                }
                
                .tariff-column.empty::after {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #94a3b8;
                    font-size: 14px;
                    text-align: center;
                    pointer-events: none;
                    white-space: nowrap;
                    z-index: 0;
                }
                
                .tariff-column:not(.empty)::after {
                    display: none !important;
                }
                
                .favorite-column::before {
                    content: '⭐ Избранные тарифы 1';
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }
                
                .vip-column::before {
                    content: '💎 Избранные тарифы 2';
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                }
                
                .super-column::before {
                    content: '🌟 Избранные тарифы 3';
                    background: linear-gradient(135deg, #ec489a, #db2777);
                }
                
                .main-column::before {
                    content: '📋 Все тарифы';
                    background: linear-gradient(135deg, #64748b, #475569);
                }
                
                .favorite-column.empty::after {
                    content: 'Перетащите сюда тарифы в Избранные тарифы 1';
                }
                
                .vip-column.empty::after {
                    content: 'Перетащите сюда тарифы в Избранные тарифы 2';
                }
                
                .super-column.empty::after {
                    content: 'Перетащите сюда тарифы в Избранные тарифы 3';
                }
                
                .main-column.empty::after {
                    content: 'Нет доступных тарифов';
                }
                
                .css-nr5n4g.e1wi2kqa9 {
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                    flex: 0 0 100% !important;
                    box-sizing: border-box !important;
                    margin-bottom: 16px;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 1;
                }
                
                .css-nr5n4g.e1wi2kqa9:last-child {
                    margin-bottom: 0;
                }
                
                .tariff-header-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: -2px !important;
                    width: 100%;
                }
                
                .tariff-date-moved {
                    font-size: 12px;
                    color: #64748b;
                    margin-top: -7px !important;
                    line-height: 1.3;
                    transition: font-size 0.2s ease;
                }
                
                .original-date-hidden {
                    display: none !important;
                }
                
                .drag-over {
                    border: 2px solid #3b82f6 !important;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02)) !important;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    transform: scale(1.01);
                }
                
                .tariff-pin-btn, .tariff-drag-handle {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    background: #f1f5f9 !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #475569 !important;
                    width: 28px !important;
                    height: 28px !important;
                    min-width: 28px !important;
                    min-height: 28px !important;
                    border-radius: 6px !important;
                    padding: 0 !important;
                    margin-left: 6px !important;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .tariff-pin-btn span, .tariff-drag-handle span {
                    font-size: 14px !important;
                }
                
                .tariff-pin-btn:hover, .tariff-drag-handle:hover {
                    transform: scale(1.05);
                    background: #e2e8f0 !important;
                    border-color: #94a3b8 !important;
                    color: #1e293b !important;
                }
                
                .tariff-drag-handle {
                    cursor: grab;
                }
                
                .tariff-drag-handle:active {
                    cursor: grabbing;
                }
                
                .tariff-pin-btn.pinned-favorite {
                    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
                    border-color: transparent !important;
                    color: white !important;
                }
                
                .tariff-pin-btn.pinned-vip {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
                    border-color: transparent !important;
                    color: white !important;
                }
                
                .tariff-pin-btn.pinned-super {
                    background: linear-gradient(135deg, #ec489a, #db2777) !important;
                    border-color: transparent !important;
                    color: white !important;
                }
                
                .tariff-pin-btn.pinned-favorite:hover,
                .tariff-pin-btn.pinned-vip:hover,
                .tariff-pin-btn.pinned-super:hover {
                    transform: scale(1.05);
                    filter: brightness(1.1);
                }
                
                .css-1yydxi7 {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    width: 100% !important;
                }
            `;
            document.head.appendChild(style);
        }

        setupPageVisibility() {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.initialized) {
                    setTimeout(() => {
                        if (this.initialized) {
                            this.forceResizeText();
                        }
                    }, 100);
                }
            });
            
            window.addEventListener('pageshow', (event) => {
                if (event.persisted && this.initialized) {
                    setTimeout(() => {
                        this.forceResizeText();
                    }, 100);
                }
            });
            
            window.addEventListener('beforeunload', () => {
                if (this.initialized) {
                    this.saveSettings();
                }
            });
        }

        setupResizeListener() {
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    if (this.initialized) {
                        this.forceResizeText();
                    }
                }, 100);
            });
        }

        setupSpaDetection() {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            const self = this;
            
            history.pushState = function() {
                originalPushState.apply(this, arguments);
                self.scheduleNavigation();
            };
            
            history.replaceState = function() {
                originalReplaceState.apply(this, arguments);
                self.scheduleNavigation();
            };
            
            window.addEventListener('popstate', () => {
                self.scheduleNavigation();
            });
            
            let lastUrl = window.location.href;
            this.checkInterval = setInterval(() => {
                const currentUrl = window.location.href;
                if (currentUrl !== lastUrl && !this.isHandlingNavigation && !this.isDestroying) {
                    lastUrl = currentUrl;
                    this.scheduleNavigation();
                }
            }, 2000);
        }
        
        scheduleNavigation() {
            if (this.navigationTimeout) {
                clearTimeout(this.navigationTimeout);
            }
            
            this.navigationTimeout = setTimeout(() => {
                this.handleNavigation();
            }, 300);
        }
        
        handleNavigation() {
            if (this.isHandlingNavigation || this.isDestroying) return;
            if (this.isExportPauseActive()) return;
            
            const currentUrl = window.location.href;
            
            if (currentUrl === this.lastUrl) return;
            if (!currentUrl.includes('/tariffs/')) return;
            
            this.isHandlingNavigation = true;
            this.lastUrl = currentUrl;
            
            console.log('[TariffCustomizer] Навигация обнаружена, переинициализация...');
            
            if (this.initialized) {
                this.saveSettings();
            }
            
            this.destroy();
            
            setTimeout(() => {
                this.init();
                setTimeout(() => {
                    this.isHandlingNavigation = false;
                }, 500);
            }, 200);
        }
        
        destroy() {
            if (this.isDestroying) return;
            this.isDestroying = true;
            
            this.initialized = false;
            
            if (this.loadMoreObserver) {
                this.loadMoreObserver.disconnect();
                this.loadMoreObserver = null;
            }
            
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
                this.updateTimeout = null;
            }
            
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = null;
            }
            
            if (this.navigationTimeout) {
                clearTimeout(this.navigationTimeout);
                this.navigationTimeout = null;
            }
            
            if (this.initDelayTimeout) {
                clearTimeout(this.initDelayTimeout);
                this.initDelayTimeout = null;
            }
            
            const layout = document.querySelector('.tariff-layout');
            if (layout && this.container && document.body.contains(this.container)) {
                const originalContainer = this.container;
                const allCards = [];
                
                const columns = layout.querySelectorAll('.tariff-column');
                columns.forEach(column => {
                    const cards = Array.from(column.querySelectorAll('.css-nr5n4g'));
                    allCards.push(...cards);
                });
                
                if (originalContainer) {
                    originalContainer.innerHTML = '';
                    allCards.forEach(card => {
                        if (card && card.parentNode) {
                            originalContainer.appendChild(card);
                        }
                    });
                }
                layout.remove();
            }
            
            this.container = null;
            this.mainColumn = null;
            this.favoriteColumn = null;
            this.vipColumn = null;
            this.superColumn = null;
            this.cards = [];
            this.favoriteCards = [];
            this.vipCards = [];
            this.superCards = [];
            
            this.isDestroying = false;
        }

        init() {
            if (this.initialized) return;
            if (this.initDelayTimeout) return;
            if (this.isExportPauseActive()) return;
            
            if (!window.location.href.includes('/tariffs/')) return;
            
            console.log('[TariffCustomizer] Запуск инициализации...');
            
            this.initDelayTimeout = setTimeout(() => {
                this.initDelayTimeout = null;
                
                this.setupSpaDetection();
                this.setupPageVisibility();
                this.injectGlobalStyles();
                this.injectForceStyles();
                
                this.loadSettings();
                this.waitForContainerAndCards();
            }, 100);
        }

        restoreState() {
            if (this.isRestoring || !this.initialized) return;
            if (!this.mainColumn || !this.favoriteColumn || !this.vipColumn || !this.superColumn) return;
            
            this.isRestoring = true;
            
            console.log('[TariffCustomizer] ========== НАЧАЛО ВОССТАНОВЛЕНИЯ ==========');
            
            const allCards = [
                ...Array.from(this.mainColumn.querySelectorAll('.css-nr5n4g')),
                ...Array.from(this.favoriteColumn.querySelectorAll('.css-nr5n4g')),
                ...Array.from(this.vipColumn.querySelectorAll('.css-nr5n4g')),
                ...Array.from(this.superColumn.querySelectorAll('.css-nr5n4g'))
            ];
            
            if (allCards.length === 0) {
                this.isRestoring = false;
                return;
            }
            
            this.isUpdating = true;
            
            allCards.forEach(card => {
                const cardId = this.getCardId(card);
                const isInMain = this.mainColumn && card.parentNode === this.mainColumn;
                const isInFavorite = this.favoriteColumn && card.parentNode === this.favoriteColumn;
                const isInVip = this.vipColumn && card.parentNode === this.vipColumn;
                const isInSuper = this.superColumn && card.parentNode === this.superColumn;
                
                if (isInMain) {
                    if (this.favoriteTariffs.has(cardId)) this.favoriteTariffs.delete(cardId);
                    if (this.vipTariffs.has(cardId)) this.vipTariffs.delete(cardId);
                    if (this.superTariffs.has(cardId)) this.superTariffs.delete(cardId);
                }
                else if (isInFavorite && !this.favoriteTariffs.has(cardId)) {
                    this.favoriteTariffs.add(cardId);
                }
                else if (isInVip && !this.vipTariffs.has(cardId)) {
                    this.vipTariffs.add(cardId);
                }
                else if (isInSuper && !this.superTariffs.has(cardId)) {
                    this.superTariffs.add(cardId);
                }
            });
            
            allCards.forEach(card => {
                const cardId = this.getCardId(card);
                if (this.favoriteTariffs.has(cardId)) {
                    if (this.favoriteColumn && card.parentNode !== this.favoriteColumn) {
                        this.favoriteColumn.appendChild(card);
                    }
                } else if (this.vipTariffs.has(cardId)) {
                    if (this.vipColumn && card.parentNode !== this.vipColumn) {
                        this.vipColumn.appendChild(card);
                    }
                } else if (this.superTariffs.has(cardId)) {
                    if (this.superColumn && card.parentNode !== this.superColumn) {
                        this.superColumn.appendChild(card);
                    }
                } else {
                    if (this.mainColumn && card.parentNode !== this.mainColumn) {
                        this.mainColumn.appendChild(card);
                    }
                }
            });
            
            this.collectCards();
            
            if (Object.keys(this.tariffPositions).length > 0) {
                this.applyStoredOrderToAllColumns();
            }
            
            this.updateAllPinButtons();
            this.updateColumnsEmptyState();
            this.forceResizeText();
            
            this.saveSettings();
            
            this.isUpdating = false;
            
            setTimeout(() => {
                this.isRestoring = false;
                console.log('[TariffCustomizer] ========== ВОССТАНОВЛЕНИЕ ЗАВЕРШЕНО ==========');
            }, 200);
        }
        
        applyStoredOrderToAllColumns() {
            const sortCardsInColumn = (column, cards) => {
                if (!column || !cards.length) return;
                const sorted = [...cards].sort((a, b) => {
                    const posA = this.tariffPositions[this.getCardId(a)] ?? 999999;
                    const posB = this.tariffPositions[this.getCardId(b)] ?? 999999;
                    return posA - posB;
                });
                sorted.forEach(card => column.appendChild(card));
            };
            
            sortCardsInColumn(this.mainColumn, this.cards);
            sortCardsInColumn(this.favoriteColumn, this.favoriteCards);
            sortCardsInColumn(this.vipColumn, this.vipCards);
            sortCardsInColumn(this.superColumn, this.superCards);
        }

        waitForContainerAndCards() {
            if (this.initialized) return;
            
            this.initAttempts++;
            
            this.container = this.findContainer();
            
            if (this.container) {
                const cards = this.container.querySelectorAll('.css-nr5n4g');
                
                if (cards.length > 0) {
                    console.log('[TariffCustomizer] Найдено карточек:', cards.length);
                    this.initializeUI();
                    this.setupLoadMoreObserver();
                    this.initAttempts = 0;
                    this.recoveryAttempts = 0;
                } else if (this.initAttempts < 20) {
                    setTimeout(() => this.waitForContainerAndCards(), 300);
                } else {
                    console.log('[TariffCustomizer] Не найдено карточек, отмена');
                }
            } else if (this.initAttempts < 20) {
                setTimeout(() => this.waitForContainerAndCards(), 300);
            }
        }
        
        setupLoadMoreObserver() {
            this.loadMoreObserver = new MutationObserver((mutations) => {
                let hasNewCards = false;
                
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1 && node.classList?.contains('css-nr5n4g')) {
                                hasNewCards = true;
                                break;
                            }
                        }
                    }
                }
                
                if (hasNewCards && !this.isLoadingMore && this.initialized) {
                    this.isLoadingMore = true;
                    setTimeout(() => {
                        this.handleNewCards();
                        this.isLoadingMore = false;
                    }, 100);
                }
            });
            
            if (this.container) {
                this.loadMoreObserver.observe(this.container, { childList: true, subtree: true });
            }
        }
        
        handleNewCards() {
            if (!this.initialized) return;
            
            console.log('[TariffCustomizer] Обнаружены новые карточки, обновляем...');
            
            this.collectCards();
            
            const allCards = [...this.cards, ...this.favoriteCards, ...this.vipCards, ...this.superCards];
            let hasNew = false;
            
            allCards.forEach(card => {
                const id = this.getCardId(card);
                if (!card.querySelector('.tariff-pin-btn')) {
                    this.createPinButton(card, id);
                    hasNew = true;
                }
                if (!card.querySelector('.tariff-drag-handle')) {
                    this.createDragHandle(card, id);
                    hasNew = true;
                }
            });
            
            if (hasNew) {
                this.restoreState();
                this.saveCurrentPositions();
                this.forceResizeText();
                console.log('[TariffCustomizer] Новые карточки обработаны');
            }
        }

        findContainer() {
            const container = document.querySelector('.css-1fttcpj');
            if (container && container.querySelectorAll('.css-nr5n4g').length > 0) {
                return container;
            }
            
            const firstCard = document.querySelector('.css-nr5n4g');
            if (firstCard && firstCard.parentElement) {
                return firstCard.parentElement;
            }
            
            return null;
        }

        initializeUI() {
            if (this.initialized) return;
            
            console.log('[TariffCustomizer] Инициализация UI...');
            
            this.createColumnsLayout();
            this.collectCards();
            this.moveDateUnderTitle();
            
            if (Object.keys(this.tariffPositions).length > 0) {
                this.applyStoredOrderToAllColumns();
            }
            
            this.addCustomizationUI();
            this.setupObserver();
            this.initialized = true;
            
            setTimeout(() => {
                this.restoreState();
                this.forceResizeText();
                this.setupResizeListener();
            }, 100);
            
            setTimeout(() => {
                this.showNotification('✨ Кастомизация тарифов готова', 'success');
            }, 500);
        }
        
        createColumnsLayout() {
            if (!this.container) return;
            if (document.querySelector('.tariff-layout')) return;
            
            console.log('[TariffCustomizer] Создание колонок...');
            
            const originalCards = Array.from(this.container.children);
            
            const layout = document.createElement('div');
            layout.className = 'tariff-layout';
            
            const topColumns = document.createElement('div');
            topColumns.className = 'tariff-top-columns';
            
            const favoriteColumn = document.createElement('div');
            favoriteColumn.className = 'tariff-column favorite-column';
            favoriteColumn.id = 'favorite-column';
            
            const vipColumn = document.createElement('div');
            vipColumn.className = 'tariff-column vip-column';
            vipColumn.id = 'vip-column';
            
            const superColumn = document.createElement('div');
            superColumn.className = 'tariff-column super-column';
            superColumn.id = 'super-column';
            
            topColumns.appendChild(favoriteColumn);
            topColumns.appendChild(vipColumn);
            topColumns.appendChild(superColumn);
            
            const bottomColumns = document.createElement('div');
            bottomColumns.className = 'tariff-bottom-columns';
            
            const mainColumn = document.createElement('div');
            mainColumn.className = 'tariff-column main-column';
            mainColumn.id = 'main-column';
            
            bottomColumns.appendChild(mainColumn);
            
            layout.appendChild(topColumns);
            layout.appendChild(bottomColumns);
            
            this.container.innerHTML = '';
            this.container.appendChild(layout);
            
            this.favoriteColumn = favoriteColumn;
            this.vipColumn = vipColumn;
            this.superColumn = superColumn;
            this.mainColumn = mainColumn;
            
            originalCards.forEach(card => {
                const cardId = this.getCardId(card);
                if (this.favoriteTariffs.has(cardId)) {
                    favoriteColumn.appendChild(card);
                } else if (this.vipTariffs.has(cardId)) {
                    vipColumn.appendChild(card);
                } else if (this.superTariffs.has(cardId)) {
                    superColumn.appendChild(card);
                } else {
                    mainColumn.appendChild(card);
                }
            });
            
            this.setupColumnsDragDrop();
        }
        
        setupColumnsDragDrop() {
            const columns = [this.favoriteColumn, this.vipColumn, this.superColumn, this.mainColumn];
            
            columns.forEach(column => {
                if (!column) return;
                
                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (this.draggedItem) {
                        column.classList.add('drag-over-column');
                    }
                });
                
                column.addEventListener('dragleave', () => {
                    column.classList.remove('drag-over-column');
                });
                
                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    column.classList.remove('drag-over-column');
                    
                    if (this.draggedItem) {
                        console.log('[TariffCustomizer] Событие drop на колонке:', column.id);
                        this.moveCardToColumn(this.draggedItem, column.id);
                    }
                });
            });
        }
        
        moveCardToColumn(card, columnId) {
            const cardId = this.getCardId(card);
            let targetColumn;
            let category;
            
            console.log('[TariffCustomizer] ========== ПЕРЕМЕЩЕНИЕ МЕЖДУ КОЛОНКАМИ ==========');
            console.log('[TariffCustomizer] Карточка:', cardId);
            console.log('[TariffCustomizer] В колонку:', columnId);
            
            this.favoriteTariffs.delete(cardId);
            this.vipTariffs.delete(cardId);
            this.superTariffs.delete(cardId);
            
            switch(columnId) {
                case 'favorite-column':
                    targetColumn = this.favoriteColumn;
                    category = 'favorite';
                    this.favoriteTariffs.add(cardId);
                    break;
                case 'vip-column':
                    targetColumn = this.vipColumn;
                    category = 'vip';
                    this.vipTariffs.add(cardId);
                    break;
                case 'super-column':
                    targetColumn = this.superColumn;
                    category = 'super';
                    this.superTariffs.add(cardId);
                    break;
                default:
                    targetColumn = this.mainColumn;
                    category = 'main';
                    break;
            }
            
            targetColumn.appendChild(card);
            
            this.collectCards();
            this.updateAllPinButtons();
            this.saveSettings();
            this.updateColumnsEmptyState();
            this.forceResizeText();
            
            const messages = {
                favorite: '⭐ Добавлено в Избранные 1',
                vip: '💎 Добавлено в Избранные 2',
                super: '🌟 Добавлено в Избранные 3',
                main: '📋 Возвращено в основные'
            };
            
            this.showNotification(messages[category], 'success');
        }
        
        updateAllPinButtons() {
            const allCards = document.querySelectorAll('.css-nr5n4g');
            
            allCards.forEach(card => {
                const cardId = this.getCardId(card);
                const pinBtn = card.querySelector('.tariff-pin-btn');
                
                if (pinBtn) {
                    let category = 'main';
                    if (this.favoriteTariffs.has(cardId)) {
                        category = 'favorite';
                    } else if (this.vipTariffs.has(cardId)) {
                        category = 'vip';
                    } else if (this.superTariffs.has(cardId)) {
                        category = 'super';
                    }
                    
                    pinBtn.className = `tariff-pin-btn ${category !== 'main' ? `pinned-${category}` : ''}`;
                    pinBtn.title = category !== 'main' ? `В категории: ${category}` : 'Выберите категорию';
                    
                    const icons = { favorite: '⭐', vip: '💎', super: '🌟', main: '📋' };
                    pinBtn.innerHTML = `<span>${icons[category]}</span>`;
                }
            });
        }
        
        updateColumnsEmptyState() {
            const columns = [this.favoriteColumn, this.vipColumn, this.superColumn, this.mainColumn];
            
            columns.forEach(col => {
                if (col) {
                    const hasCards = col.children.length > 0;
                    if (hasCards) {
                        col.classList.remove('empty');
                    } else {
                        col.classList.add('empty');
                    }
                }
            });
        }

        moveDateUnderTitle() {
            const allCards = [...this.cards, ...this.favoriteCards, ...this.vipCards, ...this.superCards];
            allCards.forEach(card => {
                const titleContainer = card.querySelector('.css-qv45v3');
                if (!titleContainer) return;
                
                const dateElement = titleContainer.querySelector('.css-knzesm');
                const titleElement = titleContainer.querySelector('.css-17i8ct5');
                if (!dateElement || !titleElement) return;
                if (dateElement.classList.contains('tariff-date-moved')) return;
                
                const wrapper = document.createElement('div');
                wrapper.className = 'tariff-header-wrapper';
                
                const titleClone = titleElement.cloneNode(true);
                const dateClone = dateElement.cloneNode(true);
                
                dateClone.classList.add('tariff-date-moved');
                wrapper.appendChild(titleClone);
                wrapper.appendChild(dateClone);
                
                titleContainer.innerHTML = '';
                titleContainer.appendChild(wrapper);
                dateElement.classList.add('original-date-hidden');
            });
        }

        getCardId(card) {
            if (card.dataset.tariffId) return card.dataset.tariffId;
            
            const titleElement = card.querySelector('.css-17i8ct5');
            if (titleElement) {
                let tariffName = titleElement.textContent.trim()
                    .replace(/[^\wа-яё]/gi, '_')
                    .replace(/_+/g, '_')
                    .toLowerCase();
                card.dataset.tariffId = tariffName;
                return tariffName;
            }
            
            const fallbackId = 'tariff_' + Date.now() + '_' + Math.random();
            card.dataset.tariffId = fallbackId;
            return fallbackId;
        }

        saveCurrentPositions() {
            const allCardsOrdered = [];
            
            if (this.mainColumn) {
                const mainCards = Array.from(this.mainColumn.querySelectorAll('.css-nr5n4g'));
                allCardsOrdered.push(...mainCards);
            }
            if (this.favoriteColumn) {
                const favoriteCards = Array.from(this.favoriteColumn.querySelectorAll('.css-nr5n4g'));
                allCardsOrdered.push(...favoriteCards);
            }
            if (this.vipColumn) {
                const vipCards = Array.from(this.vipColumn.querySelectorAll('.css-nr5n4g'));
                allCardsOrdered.push(...vipCards);
            }
            if (this.superColumn) {
                const superCards = Array.from(this.superColumn.querySelectorAll('.css-nr5n4g'));
                allCardsOrdered.push(...superCards);
            }
            
            const newPositions = {};
            allCardsOrdered.forEach((card, index) => {
                newPositions[this.getCardId(card)] = index;
            });
            
            this.tariffPositions = newPositions;
            this.saveSettings();
        }

        collectCards() {
            if (this.mainColumn) {
                this.cards = Array.from(this.mainColumn.querySelectorAll('.css-nr5n4g'));
            }
            if (this.favoriteColumn) {
                this.favoriteCards = Array.from(this.favoriteColumn.querySelectorAll('.css-nr5n4g'));
            }
            if (this.vipColumn) {
                this.vipCards = Array.from(this.vipColumn.querySelectorAll('.css-nr5n4g'));
            }
            if (this.superColumn) {
                this.superCards = Array.from(this.superColumn.querySelectorAll('.css-nr5n4g'));
            }
            this.updateColumnsEmptyState();
        }

        saveSettings() {
            const settings = {
                favoriteTariffs: Array.from(this.favoriteTariffs),
                vipTariffs: Array.from(this.vipTariffs),
                superTariffs: Array.from(this.superTariffs),
                tariffPositions: this.tariffPositions,
                version: '3.0',
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(settings));
        }

        loadSettings() {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                try {
                    const settings = JSON.parse(saved);
                    this.favoriteTariffs = new Set(settings.favoriteTariffs || []);
                    this.vipTariffs = new Set(settings.vipTariffs || []);
                    this.superTariffs = new Set(settings.superTariffs || []);
                    this.tariffPositions = settings.tariffPositions || {};
                } catch (e) {
                    console.error('Ошибка загрузки:', e);
                }
            }
        }

        createPinButton(card, tariffId) {
            const buttonContainer = card.querySelector('.css-1yydxi7');
            if (!buttonContainer) return null;
            if (buttonContainer.querySelector('.tariff-pin-btn')) return null;
            
            let category = 'main';
            if (this.favoriteTariffs.has(tariffId)) category = 'favorite';
            else if (this.vipTariffs.has(tariffId)) category = 'vip';
            else if (this.superTariffs.has(tariffId)) category = 'super';
            
            const pinButton = document.createElement('button');
            pinButton.className = `tariff-pin-btn ${category !== 'main' ? `pinned-${category}` : ''}`;
            pinButton.title = category !== 'main' ? `В категории: ${category}` : 'Выберите категорию';
            
            const icons = { favorite: '⭐', vip: '💎', super: '🌟', main: '📋' };
            pinButton.innerHTML = `<span>${icons[category]}</span>`;
            
            const categoryMenu = document.createElement('div');
            categoryMenu.style.cssText = `
                position: absolute;
                display: none;
                flex-direction: column;
                gap: 4px;
                background: white;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 4px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            
            const categories = [
                { id: 'main', name: '📋 Основные', color: '#64748b' },
                { id: 'favorite', name: '⭐ Избранные 1', color: '#f59e0b' },
                { id: 'vip', name: '💎 Избранные 2', color: '#8b5cf6' },
                { id: 'super', name: '🌟 Избранные 3', color: '#ec489a' }
            ];
            
            categories.forEach(cat => {
                const option = document.createElement('button');
                option.textContent = cat.name;
                option.style.cssText = `
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    background: white;
                    color: ${cat.color};
                `;
                option.onmouseenter = () => option.style.background = '#f1f5f9';
                option.onmouseleave = () => option.style.background = 'white';
                option.onclick = (e) => {
                    e.stopPropagation();
                    this.moveCardToCategory(card, tariffId, cat.id);
                    categoryMenu.style.display = 'none';
                };
                categoryMenu.appendChild(option);
            });
            
            document.body.appendChild(categoryMenu);
            
            pinButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = pinButton.getBoundingClientRect();
                categoryMenu.style.display = 'flex';
                categoryMenu.style.position = 'fixed';
                categoryMenu.style.top = `${rect.bottom + 4}px`;
                categoryMenu.style.left = `${rect.left}px`;
                
                setTimeout(() => {
                    document.addEventListener('click', function closeMenu(event) {
                        if (!categoryMenu.contains(event.target) && event.target !== pinButton) {
                            categoryMenu.style.display = 'none';
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            });
            
            buttonContainer.insertBefore(pinButton, buttonContainer.firstChild);
            return pinButton;
        }
        
        createDragHandle(card, tariffId) {
            const buttonContainer = card.querySelector('.css-1yydxi7');
            if (!buttonContainer) return null;
            if (buttonContainer.querySelector('.tariff-drag-handle')) return null;
            
            const dragHandle = document.createElement('button');
            dragHandle.className = 'tariff-drag-handle';
            dragHandle.title = 'Перетащить карточку';
            dragHandle.innerHTML = '<span>⋮⋮</span>';
            dragHandle.style.cursor = 'grab';
            
            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startDrag(e, card, tariffId);
            });
            
            const pinBtn = buttonContainer.querySelector('.tariff-pin-btn');
            if (pinBtn) {
                pinBtn.insertAdjacentElement('afterend', dragHandle);
            } else {
                buttonContainer.insertBefore(dragHandle, buttonContainer.firstChild);
            }
            
            return dragHandle;
        }

        startDrag(e, card, tariffId) {
            e.preventDefault();
            e.stopPropagation();
            
            this.draggedItem = card;
            const rect = card.getBoundingClientRect();
            this.dragOffsetX = e.clientX - rect.left;
            this.dragOffsetY = e.clientY - rect.top;
            
            card.style.opacity = '0.5';
            card.style.transition = 'opacity 0.2s';
            
            this.onDragMoveBound = this.onDragMove.bind(this);
            this.onDragEndBound = this.onDragEnd.bind(this);
            
            document.addEventListener('mousemove', this.onDragMoveBound);
            document.addEventListener('mouseup', this.onDragEndBound);
            document.body.style.userSelect = 'none';
            
            console.log('[TariffCustomizer] Начало перетаскивания карточки:', tariffId);
        }
        
        onDragMove(e) {
            if (!this.draggedItem) return;
            
            const elementsAtCursor = document.elementsFromPoint(e.clientX, e.clientY);
            let targetCard = null;
            let targetColumn = null;
            
            // Сначала ищем карточку (для изменения порядка внутри колонки)
            for (let el of elementsAtCursor) {
                if (el.classList?.contains('css-nr5n4g') && el !== this.draggedItem) {
                    targetCard = el;
                    break;
                }
            }
            
            // Если не нашли карточку, ищем колонку
            if (!targetCard) {
                for (let el of elementsAtCursor) {
                    if (el.classList?.contains('tariff-column')) {
                        targetColumn = el;
                        break;
                    }
                }
            }
            
            // Очищаем предыдущие подсветки
            if (this.dragOverItem) {
                this.dragOverItem.classList.remove('drag-over');
                this.dragOverItem = null;
            }
            document.querySelectorAll('.tariff-column').forEach(col => col.classList.remove('drag-over-column'));
            
            // Подсвечиваем цель
            if (targetCard && targetCard.parentNode === this.draggedItem.parentNode) {
                // Карточка в той же колонке - изменение порядка
                this.dragOverItem = targetCard;
                targetCard.classList.add('drag-over');
                console.log('[TariffCustomizer] Подсветка карточки для изменения порядка');
            } else if (targetColumn) {
                // Колонка - перемещение между колонками
                targetColumn.classList.add('drag-over-column');
                console.log('[TariffCustomizer] Подсветка колонки для перемещения:', targetColumn.id);
            }
        }
        
        onDragEnd(e) {
            if (!this.draggedItem) return;
            
            console.log('[TariffCustomizer] Окончание перетаскивания');
            
            let targetCard = null;
            let targetColumn = null;
            const elementsAtCursor = document.elementsFromPoint(e.clientX, e.clientY);
            
            // Сначала проверяем, есть ли карточка под курсором
            for (let el of elementsAtCursor) {
                if (el.classList?.contains('css-nr5n4g') && el !== this.draggedItem) {
                    targetCard = el;
                    break;
                }
            }
            
            // Если не нашли карточку, проверяем колонку
            if (!targetCard) {
                for (let el of elementsAtCursor) {
                    if (el.classList?.contains('tariff-column')) {
                        targetColumn = el;
                        break;
                    }
                }
            }
            
            // Если есть карточка в той же колонке - меняем порядок
            if (targetCard && targetCard.parentNode === this.draggedItem.parentNode) {
                console.log('[TariffCustomizer] Изменение порядка карточек');
                targetCard.classList.remove('drag-over');
                this.moveCard(this.draggedItem, targetCard);
            } 
            // Если есть колонка - перемещаем между колонками
            else if (targetColumn && targetColumn.classList.contains('drag-over-column')) {
                console.log('[TariffCustomizer] Перемещение на колонку:', targetColumn.id);
                this.moveCardToColumn(this.draggedItem, targetColumn.id);
            } 
            else {
                console.log('[TariffCustomizer] Перемещение отменено - нет цели');
            }
            
            this.draggedItem.style.opacity = '';
            document.removeEventListener('mousemove', this.onDragMoveBound);
            document.removeEventListener('mouseup', this.onDragEndBound);
            document.body.style.userSelect = '';
            
            document.querySelectorAll('.tariff-column').forEach(col => col.classList.remove('drag-over-column'));
            if (this.dragOverItem) this.dragOverItem.classList.remove('drag-over');
            
            this.draggedItem = null;
            this.dragOverItem = null;
        }
        
        moveCard(sourceCard, targetCard) {
            console.log('[TariffCustomizer] Перемещение карточки внутри колонки');
            const parent = sourceCard.parentNode;
            const targetIndex = Array.from(parent.children).indexOf(targetCard);
            const sourceIndex = Array.from(parent.children).indexOf(sourceCard);
            
            console.log('[TariffCustomizer] sourceIndex:', sourceIndex, 'targetIndex:', targetIndex);
            
            if (sourceIndex < targetIndex) {
                targetCard.parentNode.insertBefore(sourceCard, targetCard.nextSibling);
                console.log('[TariffCustomizer] Перемещено вниз');
            } else {
                targetCard.parentNode.insertBefore(sourceCard, targetCard);
                console.log('[TariffCustomizer] Перемещено вверх');
            }
            
            setTimeout(() => {
                this.collectCards();
                this.saveCurrentPositions();
                this.forceResizeText();
                this.showNotification('✨ Порядок карточек изменен', 'success');
                console.log('[TariffCustomizer] Порядок карточек сохранен');
            }, 50);
        }
        
        moveCardToCategory(card, tariffId, category) {
            let targetColumn;
            
            console.log('[TariffCustomizer] Перемещение через меню:', tariffId, 'в категорию:', category);
            
            this.favoriteTariffs.delete(tariffId);
            this.vipTariffs.delete(tariffId);
            this.superTariffs.delete(tariffId);
            
            switch(category) {
                case 'favorite':
                    targetColumn = this.favoriteColumn;
                    this.favoriteTariffs.add(tariffId);
                    break;
                case 'vip':
                    targetColumn = this.vipColumn;
                    this.vipTariffs.add(tariffId);
                    break;
                case 'super':
                    targetColumn = this.superColumn;
                    this.superTariffs.add(tariffId);
                    break;
                default:
                    targetColumn = this.mainColumn;
                    break;
            }
            
            targetColumn.appendChild(card);
            
            this.collectCards();
            this.updateAllPinButtons();
            this.saveSettings();
            this.updateColumnsEmptyState();
            this.forceResizeText();
            
            const messages = {
                favorite: '⭐ Перемещено в избранное',
                vip: '💎 Перемещено в VIP',
                super: '🌟 Перемещено в супер избранное',
                main: '📋 Перемещено в основные'
            };
            this.showNotification(messages[category], 'success');
        }

        addCustomizationUI() {
            const allCards = [...this.cards, ...this.favoriteCards, ...this.vipCards, ...this.superCards];
            allCards.forEach(card => {
                const id = this.getCardId(card);
                if (!card.querySelector('.tariff-pin-btn')) {
                    this.createPinButton(card, id);
                }
                if (!card.querySelector('.tariff-drag-handle')) {
                    this.createDragHandle(card, id);
                }
            });
        }

        setupObserver() {
            if (this.observer) this.observer.disconnect();
            
            this.observer = new MutationObserver((mutations) => {
                if (this.isUpdating || !this.initialized) return;
                
                let needRefresh = false;
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        if (mutation.addedNodes.length > 0) {
                            needRefresh = true;
                        }
                        if (mutation.target.classList?.contains('tariff-column')) {
                            this.updateColumnsEmptyState();
                        }
                    }
                }
                
                if (needRefresh) {
                    clearTimeout(this.updateTimeout);
                    this.updateTimeout = setTimeout(() => {
                        if (this.initialized && !this.isUpdating && !this.isDestroying) {
                            this.collectCards();
                            this.addCustomizationUI();
                            this.updateAllPinButtons();
                            this.updateColumnsEmptyState();
                            this.forceResizeText();
                        }
                    }, 300);
                }
            });
            
            this.observer.observe(document.body, { childList: true, subtree: true });
        }

        showNotification(msg, type = 'info') {
            const notification = document.createElement('div');
            notification.className = 'tariff-notification';
            notification.textContent = msg;
            notification.style.cssText = `
                animation: tariffFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 12px 20px;
                border-radius: 10px;
                z-index: 10001;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.25s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                background: ${type === 'success' ? '#10b981' : '#3b82f6'};
                color: white;
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        }
    }

    if (!window.tariffCustomizerInstance) {
        console.log('[TariffCustomizer] 🚀 Скрипт загружен');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.tariffCustomizerInstance = new TariffCustomizer();
            });
        } else {
            window.tariffCustomizerInstance = new TariffCustomizer();
        }
    }
})();