

export default class {
    keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
    };

    tab_wrapper = "[data-tab]";
    tab_list = "[data-tab-list]";
    tab_item = "[data-tab-item]";
    tab_pane = "[data-tab-pane]";
    active_class = "is-active";

    constructor() {
        this.run(document);
    }
    run(d) {
        this.tab = d.querySelectorAll(this.tab_wrapper);
        this.tab_navs = [];
        this.tab_panes = [];

        if (this.tab.length > 0) {
            this.tab.forEach((tab, i) => {
                const tab_list = tab.querySelectorAll(this.tab_list);

                if (tab_list.length > 0) {
                    tab_list.forEach((list) => {
                        list.setAttribute("role", "tablist");
                    });
                }

                const tab_panes = tab.querySelectorAll(this.tab_pane);
                this.tab_panes.push(tab_panes);
                if (tab_panes.length > 0) {
                    tab_panes.forEach((pane, index) => {
                        pane.setAttribute("aria-labeledby", "c-tab-" + i + index);
                        pane.setAttribute("role", "tabpanel");
                        pane.setAttribute("tabindex", 0);
                        pane.setAttribute("hidden", "hidden");
                    });
                }

                const tab_items = tab.querySelectorAll(this.tab_item);
                const tab_items_active = tab.querySelector(
                    this.tab_item + "." + this.active_class
                );
                const tab_panes_active = tab.querySelector(
                    this.tab_pane + "." + this.active_class
                );
                this.tab_navs.push(tab_items);

                if (window.location.hash) {
                    this.hashTarget = tab.querySelector(
                        '[aria-controls="' + window.location.hash.replace("#", "") + '"]'
                    );
                }

                if (tab_items.length > 0) {
                    tab_items.forEach((tab_nav, index) => {
                        tab_nav.setAttribute("role", "tab");
                        tab_nav.setAttribute("id", "c-tab-" + i + index);
                        tab_nav.setAttribute("aria-selected", false);
                        tab_nav.setAttribute("tabindex", -1);

                        if (!tab_items_active && !this.hashTarget) {
                            if (index == 0) {
                                const pane_id = tab_nav.getAttribute("aria-controls");
                                this._open(tab_nav, pane_id);
                            }
                        }
                        this._addEvent(tab_nav, i, index, tab_items);
                    });
                    if (this.hashTarget) {
                        if (tab_items_active) {
                            tab_items_active.classList.remove(this.active_class);
                        }
                        if (tab_panes_active) {
                            tab_panes_active.classList.remove(this.active_class);
                        }
                        const pane_id = this.hashTarget.getAttribute("aria-controls");
                        this._open(this.hashTarget, pane_id);
                    } else if (tab_items_active) {
                        const pane_id = tab_items_active.getAttribute("aria-controls");
                        this._open(tab_items_active, pane_id);
                    }
                }
            });
        }
    }

    _addEvent(el, i, index, tab_items) {
        el.addEventListener("click", (e) => {
            this._hide(i);

            const pane_id = el.getAttribute("aria-controls");
            this._open(el, pane_id);
        });
        el.addEventListener("keydown", (e) => {
            const k = e.which || e.keyCode;
            let position = index;
            if (k >= this.keys.left && k <= this.keys.down) {
                if (k == this.keys.left || k == this.keys.up) {
                    if (position > 0) {
                        e.preventDefault();
                        position--;
                        tab_items[position].click();
                        tab_items[position].focus();
                    }
                } else if (k == this.keys.right || k == this.keys.down) {
                    if (position < tab_items.length - 1) {
                        e.preventDefault();
                        position++;
                        tab_items[position].click();
                        tab_items[position].focus();
                    }
                }
            }
        });
    }
    _open(item, pane_id) {
        const target_pane = document.querySelector("#" + pane_id);
        if (!target_pane) return;

        item.classList.add(this.active_class);
        item.setAttribute("aria-selected", true);
        item.setAttribute("tabindex", 0);
        target_pane.classList.add(this.active_class);
        target_pane.removeAttribute("hidden");
    }
    _hide(i) {
        const tab = this.tab[i];
        const item_active = tab.querySelector(
            this.tab_item + "." + this.active_class
        );
        const pane_active = tab.querySelector(
            this.tab_pane + "." + this.active_class
        );
        if (item_active) {
            item_active.classList.remove(this.active_class);
            item_active.setAttribute("aria-selected", false);
            item_active.setAttribute("tabindex", "-1");
        }
        if (pane_active) {
            pane_active.classList.remove(this.active_class);
            pane_active.setAttribute("hidden", "hidden");
        }
    }
}
