(function() {
    'use strict';

    if (window.TariffToolsCore) return;

    const ROUTES = {
        tariffsList: /\/configurator\/tariffs\/?(?:\?|#)?$/,
        tariffsAny: /\/configurator\/tariffs(?:\b|\/|\?|#)/,
        delOrgsAny: /\/configurator\/del-orgs(?:\b|\/|\?|#)/
    };

    const Storage = {
        getJSON(key, fallback = null) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (error) {
                console.warn('[TariffToolsCore] Failed to parse storage key:', key, error);
                return fallback;
            }
        },
        setJSON(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('[TariffToolsCore] Failed to write storage key:', key, error);
                return false;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('[TariffToolsCore] Failed to remove storage key:', key, error);
                return false;
            }
        }
    };

    const DOM = {
        isVisible(element) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        },
        queryFirst(selectors, root = document) {
            for (const selector of selectors || []) {
                try {
                    const el = root.querySelector(selector);
                    if (el) return el;
                } catch (error) {
                    console.warn('[TariffToolsCore] Invalid selector:', selector, error);
                }
            }
            return null;
        },
        queryAll(selectors, root = document) {
            const seen = new Set();
            const results = [];
            for (const selector of selectors || []) {
                try {
                    root.querySelectorAll(selector).forEach((el) => {
                        if (!seen.has(el)) {
                            seen.add(el);
                            results.push(el);
                        }
                    });
                } catch (error) {
                    console.warn('[TariffToolsCore] Invalid selector:', selector, error);
                }
            }
            return results;
        },
        findByText(text, selectors = ['button', 'span', 'div', 'h1', 'h2', 'h3', 'label'], root = document) {
            const normalized = String(text || '').trim().toLowerCase();
            if (!normalized) return null;
            for (const selector of selectors) {
                const nodes = root.querySelectorAll(selector);
                for (const node of nodes) {
                    const value = (node.textContent || '').trim().toLowerCase();
                    if (value === normalized) return node;
                }
            }
            return null;
        },
        waitForElement(resolver, { timeout = 6000, interval = 200 } = {}) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const timer = setInterval(() => {
                    try {
                        const element = typeof resolver === 'function' ? resolver() : document.querySelector(resolver);
                        if (element) {
                            clearInterval(timer);
                            resolve(element);
                            return;
                        }
                        if (Date.now() - start >= timeout) {
                            clearInterval(timer);
                            reject(new Error('Element not found in time'));
                        }
                    } catch (error) {
                        clearInterval(timer);
                        reject(error);
                    }
                }, interval);
            });
        }
    };

    const SidebarManager = {
        ids: new Set([
            'tariff-export-sidebar',
            'tariff-create-config-sidebar',
            'tariff-create-progress-sidebar',
            'tariff-update-config-sidebar',
            'tariff-update-sidebar'
        ]),
        register(id) {
            if (id) this.ids.add(id);
        },
        hide(id) {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        },
        show(id) {
            const element = document.getElementById(id);
            if (element) {
                this.closeAllExcept(id);
                element.style.display = 'flex';
            }
        },
        closeAllExcept(activeId = null) {
            this.ids.forEach((id) => {
                if (id === activeId) return;
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }
    };

    const Page = {
        isTariffsPage(url = window.location.href) {
            return ROUTES.tariffsAny.test(url);
        },
        isTariffsListPage(url = window.location.href) {
            return ROUTES.tariffsList.test(url);
        },
        isDelOrgsPage(url = window.location.href) {
            return ROUTES.delOrgsAny.test(url);
        },
        isSupportedPage(url = window.location.href) {
            return this.isTariffsPage(url) || this.isDelOrgsPage(url);
        },
        label(url = window.location.href) {
            if (this.isDelOrgsPage(url)) return 'страница del-orgs';
            if (this.isTariffsPage(url)) return 'страница тарифов';
            return 'неподдерживаемая страница';
        }
    };

    const ResizeSettings = {
        get() {
            return Storage.getJSON('tariff_tools_resize_settings', {
                heightPercent: 82,
                minHeight: 420,
                maxHeight: 980
            });
        },
        responsiveHeight() {
            const settings = this.get();
            const screenHeight = window.innerHeight;
            const calculated = Math.round(screenHeight * ((settings.heightPercent || 82) / 100));
            return Math.max(settings.minHeight || 420, Math.min(calculated, settings.maxHeight || 980));
        }
    };

    function gatherDiagnostics() {
        const sidebarStates = {};
        SidebarManager.ids.forEach((id) => {
            const el = document.getElementById(id);
            sidebarStates[id] = !!(el && DOM.isVisible(el));
        });

        return {
            url: window.location.href,
            pageLabel: Page.label(),
            supportedPage: Page.isSupportedPage(),
            modules: {
                export: !!window.tariffExportPro,
                create: !!window.tariffCreatorPro,
                update: !!window.tariffUpdaterPro,
                customizer: !!window.tariffCustomizerInstance,
                resizeFeatureEnabled: window.__disableResizeObservers !== true
            },
            sidebars: sidebarStates,
            dialogs: {
                volumeWeight: !!document.getElementById('select-volume-weight-dlg'),
                branches: !!document.getElementById('select-branches-dlg'),
                intervals: !!document.getElementById('select-invervals-dlg'),
                schedule: !!document.getElementById('select-schedule-dlg')
            }
        };
    }

    window.TariffToolsCore = {
        ROUTES,
        Storage,
        DOM,
        Page,
        SidebarManager,
        ResizeSettings,
        getDiagnostics: gatherDiagnostics
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request?.type === 'GET_TARIFF_TOOLS_DIAGNOSTICS') {
                sendResponse(gatherDiagnostics());
                return true;
            }
            return false;
        });
    }
})();
