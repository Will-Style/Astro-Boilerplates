import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default class {
    accordion_wrapper = "[data-accordion]";
    accordion_details = "[data-accordion-details]";
    accordion_summary = "[data-accordion-summary]";
    accordion_content = "[data-accordion-content]";
    active_class = ":is-accordion-active";

    details = [];
    summary = [];
    contents = [];

    keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
    };
    constructor() {
       
        this.run(document);
    }
    run(d) {
        this.accordions = [];
        this.accordions_elements = d.querySelectorAll(
            this.accordion_wrapper
        );

        if (this.accordions_elements.length > 0) {
        
            this.accordions_elements.forEach((accordion, i) => {
                const details = accordion.querySelectorAll(this.accordion_details);
                const summaries = accordion.querySelectorAll(this.accordion_summary);
                const contents = accordion.querySelectorAll(this.accordion_content);

                const accordionObj = {
                    id: i,
                    toggle: accordion.getAttribute("data-accordion"),
                    duration: accordion.getAttribute("data-duration")
                        ? accordion.getAttribute("data-duration")
                        : 0.3,
                    parent: accordion,
                    details: details,
                    summaries: summaries,
                    contents: contents,
                };
                if (details.length > 0) {
                    details.forEach((detail, index) => {
                        const summary = detail.querySelector(this.accordion_summary);
                        const content = detail.querySelector(this.accordion_content);

                        this._addEvent(summary, detail, content, index, accordionObj);
                    });
                }

                if (window.location.hash) {
                    this.hashTarget = accordion.querySelector("" + window.location.hash);

                    if (this.hashTarget) {
                        if (accordionObj.toggle) {
                            this._closeAll(accordionObj, 0);
                        }
                        this._animation(
                            this.hashTarget,
                            "open",
                            0,
                            this.hashTarget.parentElement
                        );
                    }
                }

                this.accordions.push(accordionObj);
            });

            window.Accordion = this.accordions;
        }
    }
    _addEvent(el, detail, content, index, accordionObj) {
        el.addEventListener("click", (e) => {
            e.preventDefault();

            if (content) {
                if (!detail.hasAttribute("open")) {
                    if (accordionObj.toggle) {
                        this._closeAll(accordionObj);
                    }

                    el.classList.add(this.active_class);
                    this._animation(content, "open", accordionObj.duration, detail);
                } else {
                    el.classList.remove(this.active_class);
                    this._close(content, accordionObj.duration, detail);
                }
            }
        });

        el.addEventListener("keydown", (e) => {
            const k = e.which || e.keyCode;
            let position = index;
            if (k >= this.keys.left && k <= this.keys.down) {
                if (k == this.keys.left || k == this.keys.up) {
                    if (position > 0) {
                        e.preventDefault();
                        position--;
                        accordionObj.summaries[position].focus();
                    }
                } else if (k == this.keys.right || k == this.keys.down) {
                    if (position < accordionObj.summaries.length - 1) {
                        e.preventDefault();
                        position++;
                        accordionObj.summaries[position].focus();
                    }
                }
            }
        });
    }
    _close(content, duration, detail) {
        if (content) {
            this._animation(content, "close", duration, detail);
        }
    }
    _closeAll(accordionObj, d) {
        const duration = d != undefined ? d : accordionObj.duration;
        if (accordionObj.details.length > 0) {
            accordionObj.details.forEach((detail) => {
                const content = detail.querySelector(this.accordion_content);
                if (detail.hasAttribute("open")) {
                    this._animation(content, "close", duration, detail);
                }
            });
        }
    }
    _animation(el, type, duration, detail) {
        if (type == "open") {
            el.classList.add(this.active_class);
            el.style.height = 0;

            detail.setAttribute("open", "");

            gsap.to(el, {
                height: "auto",
                duration: duration,
                ease: "expo.out"
               
            });
        } else {
            el.classList.remove(this.active_class);
            gsap.to(el, {
                height: 0,
                duration: duration,
                ease: "expo.out",
                onComplete: () => {
                    detail.removeAttribute("open");
                    ScrollTrigger.refresh();
                },
            });
        }
    }
}
