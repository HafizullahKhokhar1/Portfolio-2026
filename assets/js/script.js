const GITHUB_USER = "hafizullahkhokhar1";
const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
const CONTACT_ACCESS_KEY = "";
const SUPABASE_URL = "https://dzerdddudkrquvjeowgg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZXJkZGR1ZGtycXV2amVvd2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDM0MjUsImV4cCI6MjA5MTkxOTQyNX0.7QdkciRj318RfQcCSd2gGc7COc0n2idVZspZVlUTgQA";
const SUPABASE_CHAT_FUNCTION = "portfolio-chat";
const CHATBOT_API_ENDPOINT = `${SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co")}/${SUPABASE_CHAT_FUNCTION}`;
const CHAT_SESSION_STORAGE_KEY = "hk_chat_session_id";
const CHATBOT_REQUEST_TIMEOUT_MS = 12000;
const CHATBOT_CLOSE_ANIMATION_MS = 360;
const BOOKINGS_KEY = "admin_bookings";
const CHAT_HISTORY_KEY = "hk_chat_history";
const MAX_CHAT_HISTORY_ITEMS = 24;
const LOADER_FALLBACK_MS = 3500;
const PROJECT_MARQUEE_SPEED = 0.24;
const COMPANY_MARQUEE_SPEED = 0.2;

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const allNavLinks = document.querySelectorAll(".nav-link");
const themeToggle = document.getElementById("themeToggle");
const loader = document.getElementById("loader");
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const projectsContainer = document.getElementById("github-projects");
const filterButtons = document.querySelectorAll(".filter-btn");
const revealBlocks = document.querySelectorAll(".reveal");
const prevProjectButton = document.getElementById("prevProject");
const nextProjectButton = document.getElementById("nextProject");
const companyTrack = document.getElementById("companyTrack");
const prevCompanyButton = document.getElementById("prevCompany");
const nextCompanyButton = document.getElementById("nextCompany");
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWidget = document.getElementById("chatbotWidget");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotChips = document.querySelectorAll(".chatbot-chip");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const projectHint = document.querySelector(".carousel-hint");
const servicesTrack = document.getElementById("servicesTrack");
const skillsTrack = document.getElementById("skillsTrack");
const processTrack = document.getElementById("processTrack");
const packagesTrack = document.getElementById("packagesTrack");
const sessionsTrack = document.getElementById("sessionsTrack");
const prevServiceButton = document.getElementById("prevService");
const nextServiceButton = document.getElementById("nextService");
const prevSkillsButton = document.getElementById("prevSkills");
const nextSkillsButton = document.getElementById("nextSkills");
const prevProcessButton = document.getElementById("prevProcess");
const nextProcessButton = document.getElementById("nextProcess");
const prevPackagesButton = document.getElementById("prevPackages");
const nextPackagesButton = document.getElementById("nextPackages");
const prevSessionsButton = document.getElementById("prevSessions");
const nextSessionsButton = document.getElementById("nextSessions");

const typingText = document.getElementById("typingText");
const typingItems = [
    "Full Stack solutions",
    "AI / ML solutions",
    "Agentic AI systems",
    "workflow automations",
    "prompt engineering"
];

let typingItemIndex = 0;
let typingCharIndex = 0;
let typingDeleting = false;
let projectCache = [];
let activeFilter = "all";
let chatbotMode = "local";
let chatbotCloseTimerId = null;
let chatHistoryRestored = false;
let projectMarqueeFrameId = null;
let companyMarqueeFrameId = null;
const genericMarqueeFrameIds = new Map();
const chatState = {
    collectingLead: false,
    leadStep: 0,
    lead: {
        name: "",
        email: "",
        service: "",
        budget: "",
        timeline: ""
    }
};

const leadQuestions = [
    "Great. What is your full name?",
    "Please share your email address.",
    "Which service do you need: Full Stack, AI/ML, Agentic AI, or Automation?",
    "What budget range do you have in mind?",
    "What is your expected timeline?"
];

let hasInitializedUi = false;
let hasHiddenLoader = false;

function hideLoaderSafe() {
    if (!loader || hasHiddenLoader) {
        return;
    }

    loader.classList.add("hide");
    hasHiddenLoader = true;
}

function initializeUiAfterReady() {
    if (hasInitializedUi) {
        return;
    }

    hasInitializedUi = true;

    if (chatbotWidget) {
        setChatbotMode(canUseRemoteChat() ? "remote-ready" : "local");
    }

    updateScrollUI();
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    hideLoaderSafe();
    initializeUiAfterReady();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        hideLoaderSafe();
        initializeUiAfterReady();
    }, { once: true });
}

window.addEventListener("load", () => {
    hideLoaderSafe();
    initializeUiAfterReady();
}, { once: true });

setTimeout(() => {
    hideLoaderSafe();
}, LOADER_FALLBACK_MS);

function toggleMenu(forceState) {
    if (!navLinks || !navToggle) {
        return;
    }

    const isOpen = typeof forceState === "boolean" ? forceState : !navLinks.classList.contains("open");
    navLinks.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
}

if (navToggle) {
    navToggle.addEventListener("click", () => toggleMenu());
}

allNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        toggleMenu(false);
    });
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        toggleMenu(false);
    }
});

function applyTheme(themeName) {
    const isDark = themeName === "dark";
    document.body.classList.toggle("dark", isDark);

    if (themeToggle) {
        const icon = themeToggle.querySelector("i");

        if (icon) {
            icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    }

    localStorage.setItem("portfolio-theme", themeName);
}

if (themeToggle) {
    const savedTheme = localStorage.getItem("portfolio-theme") || "light";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

function typeLoop() {
    if (!typingText) {
        return;
    }

    const currentWord = typingItems[typingItemIndex];

    if (!typingDeleting) {
        typingCharIndex += 1;
        typingText.textContent = currentWord.slice(0, typingCharIndex);

        if (typingCharIndex >= currentWord.length) {
            typingDeleting = true;
            setTimeout(typeLoop, 1200);
            return;
        }
    } else {
        typingCharIndex -= 1;
        typingText.textContent = currentWord.slice(0, typingCharIndex);

        if (typingCharIndex === 0) {
            typingDeleting = false;
            typingItemIndex = (typingItemIndex + 1) % typingItems.length;
        }
    }

    setTimeout(typeLoop, typingDeleting ? 45 : 85);
}

typeLoop();

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        {
            threshold: 0.2
        }
    );

    revealBlocks.forEach(block => sectionObserver.observe(block));

    const navObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }

                const id = entry.target.getAttribute("id");

                allNavLinks.forEach(link => {
                    const isCurrent = link.getAttribute("href") === `#${id}`;
                    link.classList.toggle("active", isCurrent);
                });
            });
        },
        {
            rootMargin: "-40% 0px -50% 0px",
            threshold: 0.1
        }
    );

    document.querySelectorAll("main section[id]").forEach(section => navObserver.observe(section));

    const counters = document.querySelectorAll(".counter");
    const counterObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.target.dataset.done === "true") {
                    return;
                }

                const target = Number(entry.target.dataset.target || 0);
                const duration = 1100;
                const startTime = performance.now();

                function animate(time) {
                    const elapsed = time - startTime;
                    const ratio = Math.min(elapsed / duration, 1);
                    const value = Math.floor(target * ratio);
                    entry.target.textContent = `${value}+`;

                    if (ratio < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        entry.target.dataset.done = "true";
                        entry.target.textContent = `${target}+`;
                    }
                }

                requestAnimationFrame(animate);
            });
        },
        {
            threshold: 0.5
        }
    );

    counters.forEach(counter => counterObserver.observe(counter));
} else {
    revealBlocks.forEach(block => block.classList.add("visible"));
    document.querySelectorAll(".counter").forEach(counter => {
        const target = Number(counter.dataset.target || 0);
        counter.textContent = `${target}+`;
        counter.dataset.done = "true";
    });
}

function classifyProject(repo) {
    const language = (repo.language || "").toLowerCase();
    const text = `${repo.name} ${repo.description || ""}`.toLowerCase();

    if (text.includes("ai") || text.includes("ml") || text.includes("nlp") || language === "python") {
        return "ai";
    }

    if (language === "javascript" || language === "typescript" || language === "html" || language === "css") {
        return "web";
    }

    return "other";
}

function buildProjectImageCandidates(repo) {
    const mergedText = `${repo.name} ${repo.description || ""}`
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ");

    const ignoredWords = new Set(["the", "with", "from", "repo", "project", "portfolio", "app", "api", "web", "full", "stack"]);
    const keywordPool = mergedText
        .split(/\s+/)
        .filter(word => word.length > 2 && !ignoredWords.has(word));

    const uniqueKeywords = [...new Set(keywordPool)].slice(0, 3);
    const searchQuery = uniqueKeywords.length ? uniqueKeywords.join(",") : repo.name;

    return [
        `https://source.unsplash.com/1600x900/?${encodeURIComponent(`${searchQuery},technology,software`)}`,
        `https://opengraph.githubassets.com/1/${GITHUB_USER}/${encodeURIComponent(repo.name)}`
    ];
}

function projectCard(repo) {
    const category = classifyProject(repo);
    const description = repo.description || "No description provided yet.";
    const stars = repo.stargazers_count ?? 0;
    const forks = repo.forks_count ?? 0;
    const language = repo.language || "Not specified";
    const imageCandidatesArray = buildProjectImageCandidates(repo);
    const imageCandidates = imageCandidatesArray.join("|");

    return `
        <article class="project-card" data-category="${category}">
            <div class="project-image">
                <img src="${imageCandidatesArray[0]}" data-candidates="${imageCandidates}" alt="${repo.name} project cover" loading="lazy">
            </div>
            <div class="project-body">
                <div class="project-title-row">
                    <h3>${repo.name}</h3>
                    <span class="tag">${category.toUpperCase()}</span>
                </div>
                <p>${description}</p>
                <div class="project-meta">
                    <span><i class="fa-solid fa-code-branch"></i> ${forks}</span>
                    <span><i class="fa-solid fa-star"></i> ${stars}</span>
                    <span><i class="fa-solid fa-layer-group"></i> ${language}</span>
                </div>
                <div class="project-footer">
                    <a class="project-link" href="${repo.html_url}" target="_blank" rel="noopener">View Repository</a>
                    ${repo.homepage ? `<a class="project-link" href="${repo.homepage}" target="_blank" rel="noopener">Live</a>` : ""}
                </div>
            </div>
        </article>
    `;
}

function renderProjects() {
    if (!projectsContainer) {
        return;
    }

    let visible = projectCache;

    if (activeFilter !== "all") {
        visible = projectCache.filter(repo => classifyProject(repo) === activeFilter);
    }

    if (!visible.length) {
        projectsContainer.innerHTML = "<article class='project-loader'><p>No projects match this filter yet.</p></article>";
        return;
    }

    projectsContainer.innerHTML = visible.map(projectCard).join("");
    hydrateProjectImages();
    setupProjectCarouselControls();
    startProjectMarquee();
}

function clearProjectClones() {
    if (!projectsContainer) {
        return;
    }

    projectsContainer.querySelectorAll(".project-card[data-clone='true']").forEach(node => node.remove());
    projectsContainer.dataset.marqueeCloned = "false";
}

function stopProjectMarquee() {
    if (projectMarqueeFrameId) {
        cancelAnimationFrame(projectMarqueeFrameId);
        projectMarqueeFrameId = null;
    }
}

function ensureProjectClones() {
    if (!projectsContainer || projectsContainer.dataset.marqueeCloned === "true") {
        return;
    }

    const cards = Array.from(projectsContainer.querySelectorAll(".project-card:not([data-clone='true'])"));

    cards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = "true";
        projectsContainer.appendChild(clone);
    });

    projectsContainer.dataset.marqueeCloned = "true";
}

function startProjectMarquee() {
    if (!projectsContainer) {
        return;
    }

    stopProjectMarquee();
    ensureProjectClones();
    projectsContainer.classList.add("marquee-mode");

    const step = () => {
        const resetPoint = projectsContainer.scrollWidth / 2;
        projectsContainer.scrollLeft += PROJECT_MARQUEE_SPEED;

        if (projectsContainer.scrollLeft >= resetPoint) {
            projectsContainer.scrollLeft = 0;
        }

        projectMarqueeFrameId = requestAnimationFrame(step);
    };

    projectMarqueeFrameId = requestAnimationFrame(step);
}

function hydrateProjectImages() {
    const images = document.querySelectorAll(".project-image img[data-candidates]");

    images.forEach(image => {
        const candidates = (image.dataset.candidates || "")
            .split("|")
            .map(item => item.trim())
            .filter(Boolean);

        let activeIndex = 0;
        const parent = image.closest(".project-image");

        function tryNextCandidate() {
            if (activeIndex >= candidates.length) {
                parent?.classList.add("no-image");
                image.remove();
                return;
            }

            image.src = candidates[activeIndex];
            activeIndex += 1;
        }

        image.onerror = tryNextCandidate;
        image.onload = () => {
            parent?.classList.remove("no-image");
        };

        tryNextCandidate();
    });
}

function scrollCarousel(trackNode, direction = 1) {
    if (!trackNode) {
        return;
    }

    const firstCard = trackNode.firstElementChild;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : trackNode.clientWidth * 0.9;
    trackNode.scrollBy({
        left: direction * cardWidth,
        behavior: "smooth"
    });
}

function stopGenericMarquee(trackNode) {
    const frameId = genericMarqueeFrameIds.get(trackNode);
    if (frameId) {
        cancelAnimationFrame(frameId);
        genericMarqueeFrameIds.delete(trackNode);
    }
}

function ensureGenericClones(trackNode, selector = ".marquee-card") {
    if (!trackNode || trackNode.dataset.marqueeCloned === "true") {
        return;
    }

    const cards = Array.from(trackNode.querySelectorAll(`${selector}:not([data-clone='true'])`));
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = "true";
        trackNode.appendChild(clone);
    });

    trackNode.dataset.marqueeCloned = "true";
}

function startGenericMarquee(trackNode, speed = 0.2, selector = ".marquee-card") {
    if (!trackNode) {
        return;
    }

    stopGenericMarquee(trackNode);
    ensureGenericClones(trackNode, selector);

    const step = () => {
        const resetPoint = trackNode.scrollWidth / 2;
        trackNode.scrollLeft += speed;

        if (trackNode.scrollLeft >= resetPoint) {
            trackNode.scrollLeft = 0;
        }

        const frameId = requestAnimationFrame(step);
        genericMarqueeFrameIds.set(trackNode, frameId);
    };

    const frameId = requestAnimationFrame(step);
    genericMarqueeFrameIds.set(trackNode, frameId);
}

function bindGenericMarquee(trackNode, prevBtn, nextBtn, speed = 0.2, selector = ".marquee-card") {
    if (!trackNode) {
        return;
    }

    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.addEventListener("click", () => scrollCarousel(trackNode, -1));
        prevBtn.dataset.bound = "true";
    }

    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.addEventListener("click", () => scrollCarousel(trackNode, 1));
        nextBtn.dataset.bound = "true";
    }

    trackNode.addEventListener("mouseenter", () => stopGenericMarquee(trackNode));
    trackNode.addEventListener("mouseleave", () => startGenericMarquee(trackNode, speed, selector));

    startGenericMarquee(trackNode, speed, selector);
}

function setupProjectCarouselControls() {
    if (!projectsContainer) {
        return;
    }

    if (prevProjectButton && !prevProjectButton.dataset.bound) {
        prevProjectButton.addEventListener("click", () => scrollCarousel(projectsContainer, -1));
        prevProjectButton.dataset.bound = "true";
    }

    if (nextProjectButton && !nextProjectButton.dataset.bound) {
        nextProjectButton.addEventListener("click", () => scrollCarousel(projectsContainer, 1));
        nextProjectButton.dataset.bound = "true";
    }

    projectsContainer.onmouseenter = () => {
        stopProjectMarquee();
    };

    projectsContainer.onmouseleave = () => {
        startProjectMarquee();
    };

    if (projectHint) {
        projectHint.textContent = "Continuous marquee is active. Use arrows for quick next/previous jumps.";
    }
}

function clearCompanyClones() {
    if (!companyTrack) {
        return;
    }

    companyTrack.querySelectorAll(".company-card[data-clone='true']").forEach(node => node.remove());
    companyTrack.dataset.marqueeCloned = "false";
}

function stopCompanyMarquee() {
    if (companyMarqueeFrameId) {
        cancelAnimationFrame(companyMarqueeFrameId);
        companyMarqueeFrameId = null;
    }
}

function ensureCompanyClones() {
    if (!companyTrack || companyTrack.dataset.marqueeCloned === "true") {
        return;
    }

    const cards = Array.from(companyTrack.querySelectorAll(".company-card:not([data-clone='true'])"));
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = "true";
        companyTrack.appendChild(clone);
    });
    companyTrack.dataset.marqueeCloned = "true";
}

function startCompanyMarquee() {
    if (!companyTrack) {
        return;
    }

    stopCompanyMarquee();
    ensureCompanyClones();

    const step = () => {
        const resetPoint = companyTrack.scrollWidth / 2;
        companyTrack.scrollLeft += COMPANY_MARQUEE_SPEED;

        if (companyTrack.scrollLeft >= resetPoint) {
            companyTrack.scrollLeft = 0;
        }

        companyMarqueeFrameId = requestAnimationFrame(step);
    };

    companyMarqueeFrameId = requestAnimationFrame(step);
}

function setupCompanyCarouselControls() {
    if (!companyTrack) {
        return;
    }

    if (prevCompanyButton && !prevCompanyButton.dataset.bound) {
        prevCompanyButton.addEventListener("click", () => scrollCarousel(companyTrack, -1));
        prevCompanyButton.dataset.bound = "true";
    }

    if (nextCompanyButton && !nextCompanyButton.dataset.bound) {
        nextCompanyButton.addEventListener("click", () => scrollCarousel(companyTrack, 1));
        nextCompanyButton.dataset.bound = "true";
    }

    companyTrack.addEventListener("mouseenter", () => {
        stopCompanyMarquee();
    });
    companyTrack.addEventListener("mouseleave", startCompanyMarquee);

    startCompanyMarquee();
}

async function fetchProjects() {
    if (!projectsContainer) {
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`, {
            headers: {
                Accept: "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            throw new Error("GitHub API request failed");
        }

        const repos = await response.json();
        projectCache = repos.filter(repo => !repo.fork).slice(0, 12);
        renderProjects();
    } catch (error) {
        projectsContainer.innerHTML = `
            <article class="project-loader">
                <p>Could not load GitHub projects right now.</p>
                <button class="btn btn-primary" type="button" id="retryProjects">Retry</button>
            </article>
        `;

        document.getElementById("retryProjects")?.addEventListener("click", fetchProjects);
        console.error(error);
    }
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.dataset.filter || "all";
        renderProjects();
    });
});

fetchProjects();
setupCompanyCarouselControls();

document.querySelectorAll(".company-logo").forEach(logo => {
    logo.addEventListener("error", () => {
        logo.closest(".company-card")?.classList.add("logo-fallback");
    });
});

const testimonialTrack = document.getElementById("testimonialTrack");
const prevButton = document.getElementById("prevTestimonial");
const nextButton = document.getElementById("nextTestimonial");
let testimonialMarqueeFrameId = null;

function stopTestimonialMarquee() {
    if (testimonialMarqueeFrameId) {
        cancelAnimationFrame(testimonialMarqueeFrameId);
        testimonialMarqueeFrameId = null;
    }
}

function ensureTestimonialClones() {
    if (!testimonialTrack || testimonialTrack.dataset.marqueeCloned === "true") {
        return;
    }

    const cards = Array.from(testimonialTrack.querySelectorAll(".testimonial-card:not([data-clone='true'])"));
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = "true";
        testimonialTrack.appendChild(clone);
    });
    testimonialTrack.dataset.marqueeCloned = "true";
}

function startTestimonialMarquee() {
    if (!testimonialTrack) {
        return;
    }

    stopTestimonialMarquee();
    ensureTestimonialClones();

    const step = () => {
        const resetPoint = testimonialTrack.scrollWidth / 2;
        testimonialTrack.scrollLeft += 0.18;

        if (testimonialTrack.scrollLeft >= resetPoint) {
            testimonialTrack.scrollLeft = 0;
        }

        testimonialMarqueeFrameId = requestAnimationFrame(step);
    };

    testimonialMarqueeFrameId = requestAnimationFrame(step);
}

if (testimonialTrack) {
    prevButton?.addEventListener("click", () => scrollCarousel(testimonialTrack, -1));
    nextButton?.addEventListener("click", () => scrollCarousel(testimonialTrack, 1));

    testimonialTrack.addEventListener("mouseenter", stopTestimonialMarquee);
    testimonialTrack.addEventListener("mouseleave", startTestimonialMarquee);
    startTestimonialMarquee();
}

bindGenericMarquee(servicesTrack, prevServiceButton, nextServiceButton, 0.16);
bindGenericMarquee(skillsTrack, prevSkillsButton, nextSkillsButton, 0.14);
bindGenericMarquee(processTrack, prevProcessButton, nextProcessButton, 0.16, "article");
bindGenericMarquee(packagesTrack, prevPackagesButton, nextPackagesButton, 0.15);
bindGenericMarquee(sessionsTrack, prevSessionsButton, nextSessionsButton, 0.14);

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setFormStatus(text, state) {
    if (!formStatus) {
        return;
    }

    formStatus.textContent = text;
    formStatus.className = `form-status ${state}`;
}

function addChatMessage(role, text) {
    if (!chatbotMessages) {
        return;
    }

    const bubble = document.createElement("article");
    bubble.className = `chatbot-bubble ${role}`;
    bubble.textContent = text;
    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
    history.push({ role, text, ts: Date.now() });
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history.slice(-MAX_CHAT_HISTORY_ITEMS)));
}

function addTypingIndicator() {
    if (!chatbotMessages) {
        return null;
    }

    const bubble = document.createElement("article");
    bubble.className = "chatbot-bubble bot";
    bubble.dataset.typing = "true";
    bubble.textContent = "Typing...";
    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return bubble;
}

function removeTypingIndicator(indicator) {
    indicator?.remove();
}

function restoreChatHistory() {
    if (!chatbotMessages || chatHistoryRestored) {
        return;
    }

    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
    history.forEach(item => {
        if (!item || !item.role || !item.text) {
            return;
        }

        const bubble = document.createElement("article");
        bubble.className = `chatbot-bubble ${item.role}`;
        bubble.textContent = item.text;
        chatbotMessages.appendChild(bubble);
    });

    chatHistoryRestored = true;
}

function openChatbot() {
    if (!chatbotWidget) {
        return;
    }

    if (chatbotCloseTimerId) {
        clearTimeout(chatbotCloseTimerId);
        chatbotCloseTimerId = null;
    }

    chatbotWidget.hidden = false;
    chatbotWidget.classList.remove("is-closing");

    requestAnimationFrame(() => {
        chatbotWidget.classList.add("is-visible");
    });

    chatbotWidget.classList.add("ai-border-active");
    restoreChatHistory();
    chatbotInput?.focus();

    if (chatbotMessages && chatbotMessages.childElementCount === 0) {
        addChatMessage(
            "bot",
            "Assalam o Alaikum. I am Hafizullah's client assistant. I can guide you on Full Stack, AI/ML, Agentic AI, Automations, pricing, and project timelines."
        );
    }
}

function closeChatbot() {
    if (!chatbotWidget || chatbotWidget.hidden) {
        return;
    }

    chatbotWidget.classList.remove("is-visible");
    chatbotWidget.classList.add("is-closing");

    if (chatbotCloseTimerId) {
        clearTimeout(chatbotCloseTimerId);
    }

    chatbotCloseTimerId = setTimeout(() => {
        chatbotWidget.hidden = true;
        chatbotWidget.classList.remove("is-closing");
        chatbotWidget.classList.remove("ai-border-active");
        chatbotCloseTimerId = null;
    }, CHATBOT_CLOSE_ANIMATION_MS);
}

function handleChatbotCloseRequest(event) {
    event?.preventDefault();
    event?.stopPropagation();
    closeChatbot();
    return false;
}

function updateScrollUI() {
    const doc = document.documentElement;
    const maxScrollable = doc.scrollHeight - window.innerHeight;
    const progress = maxScrollable > 0 ? (window.scrollY / maxScrollable) * 100 : 0;

    if (scrollProgress) {
        scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    if (backToTop) {
        backToTop.classList.toggle("visible", window.scrollY > 380);
    }
}

function canUseRemoteChat() {
    return Boolean(CHATBOT_API_ENDPOINT && SUPABASE_PUBLISHABLE_KEY);
}

function setChatbotMode(mode) {
    chatbotMode = mode;

    if (!chatbotWidget) {
        return;
    }

    chatbotWidget.dataset.mode = mode;
}

function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(timerId));
}

function localClientAssistantReply(message) {
    const text = message.toLowerCase();

    if (text.includes("api key") || text.includes("openai") || text.includes("model")) {
        return "For production security, AI keys stay on the backend only. This chatbot calls my secure Supabase Edge Function, which then talks to the AI provider safely.";
    }

    if (text.includes("full stack") || text.includes("website") || text.includes("web app")) {
        return "Full Stack service includes UI/UX, frontend, backend, database, API integrations, and deployment support. Typical budget starts from $450 depending on scope.";
    }

    if (text.includes("ai") || text.includes("ml") || text.includes("machine learning") || text.includes("model")) {
        return "AI/ML solutions include NLP, predictive systems, prompt engineering, evaluation, and production integration. I focus on practical business outcomes and reliability.";
    }

    if (text.includes("agent") || text.includes("agentic")) {
        return "Agentic AI service covers multi-step autonomous workflows: retrieval, tool usage, decision logic, and business task orchestration with human-safe controls.";
    }

    if (text.includes("automation") || text.includes("workflow")) {
        return "Automation service connects your operations with APIs, spreadsheets, messaging, and dashboards to reduce manual work and improve speed.";
    }

    if (text.includes("price") || text.includes("cost") || text.includes("budget") || text.includes("package")) {
        return "Current package direction: Starter from $50, Business Pro $450-$900, and Agentic Scale starts at $1200+. Final quote depends on requirements.";
    }

    if (text.includes("time") || text.includes("timeline") || text.includes("delivery")) {
        return "Small tasks can be 2-4 days, medium projects 1-2 weeks, and advanced systems 3-6 weeks depending on complexity.";
    }

    if (text.includes("contact") || text.includes("whatsapp") || text.includes("email")) {
        return "You can contact directly via WhatsApp, the inquiry form, or email at hafizullahkhokhar1@gmail.com.";
    }

    if (text.includes("start project") || text.includes("hire") || text.includes("let us start") || text.includes("project inquiry")) {
        chatState.collectingLead = true;
        chatState.leadStep = 0;
        return `Perfect. ${leadQuestions[chatState.leadStep]}`;
    }

    return "I can help with: services, pricing, timeline, Full Stack, AI/ML, Agentic AI, and Automation. You can also type 'start project' and I will collect your project details now.";
}

function handleLeadFlow(inputText) {
    const step = chatState.leadStep;

    if (step === 0) {
        chatState.lead.name = inputText;
    } else if (step === 1) {
        if (!validEmail(inputText)) {
            return "Please share a valid email so I can continue.";
        }
        chatState.lead.email = inputText;
    } else if (step === 2) {
        chatState.lead.service = inputText;
    } else if (step === 3) {
        chatState.lead.budget = inputText;
    } else if (step === 4) {
        chatState.lead.timeline = inputText;
    }

    chatState.leadStep += 1;

    if (chatState.leadStep < leadQuestions.length) {
        return leadQuestions[chatState.leadStep];
    }

    chatState.collectingLead = false;

    const summary = `Name: ${chatState.lead.name}\nEmail: ${chatState.lead.email}\nService: ${chatState.lead.service}\nBudget: ${chatState.lead.budget}\nTimeline: ${chatState.lead.timeline}`;
    const mailto = `mailto:hafizullahkhokhar1@gmail.com?subject=${encodeURIComponent("New Client Inquiry from Portfolio Chatbot")}&body=${encodeURIComponent(summary)}`;

    return `Excellent. I have prepared your project summary:\n\n${summary}\n\nClick this link to send it now: ${mailto}`;
}

function getChatSessionId() {
    const existing = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (existing) {
        return existing;
    }

    const generated = crypto.randomUUID();
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, generated);
    return generated;
}

function getLeadSource() {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmCampaign = params.get("utm_campaign");
    const referrer = document.referrer;

    return [utmSource, utmCampaign, referrer]
        .filter(Boolean)
        .join(" | ") || "direct";
}

async function getChatbotReply(inputText) {
    if (chatState.collectingLead) {
        return handleLeadFlow(inputText);
    }

    if (canUseRemoteChat()) {
        try {
            const sessionId = getChatSessionId();
            const source = getLeadSource();
            const response = await fetchWithTimeout(CHATBOT_API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_PUBLISHABLE_KEY,
                    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
                },
                body: JSON.stringify({
                    message: inputText,
                    session_id: sessionId,
                    source
                })
            }, CHATBOT_REQUEST_TIMEOUT_MS);

            if (response.ok) {
                const data = await response.json();
                if (data.reply) {
                    setChatbotMode("remote");
                    return data.reply;
                }
            }
        } catch (error) {
            console.error("External chatbot endpoint failed:", error);
        }
    }

    setChatbotMode("local");
    return localClientAssistantReply(inputText);
}

async function sendContactMessage(payload) {
    if (CONTACT_ACCESS_KEY) {
        const response = await fetch(CONTACT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                access_key: CONTACT_ACCESS_KEY,
                from_name: payload.name,
                subject: payload.subject,
                email: payload.email,
                message: payload.message
            })
        });

        if (!response.ok) {
            throw new Error("Contact API failed");
        }

        return true;
    }

    const mailto = `mailto:hafizullahkhokhar1@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`)}`;
    window.location.href = mailto;
    return true;
}

form?.addEventListener("submit", async event => {
    event.preventDefault();

    const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim()
    };

    if (!data.name || !data.email || !data.subject || !data.message) {
        setFormStatus("Please complete all fields.", "error");
        return;
    }

    if (!validEmail(data.email)) {
        setFormStatus("Please enter a valid email address.", "error");
        return;
    }

    try {
        setFormStatus("Sending your message...", "success");
        await sendContactMessage(data);
        setFormStatus("Message prepared successfully. I will get back to you soon.", "success");
        form.reset();
    } catch (error) {
        setFormStatus("Message could not be sent right now. Please try again.", "error");
    }
});

chatbotToggle?.addEventListener("click", openChatbot);
chatbotClose?.addEventListener("click", handleChatbotCloseRequest);

window.forceCloseChatbot = handleChatbotCloseRequest;

// Fallback: if direct binding is interrupted or the node is re-rendered, delegation still closes it.
document.addEventListener("click", event => {
    if (event.target.closest("#chatbotClose")) {
        handleChatbotCloseRequest(event);
        return;
    }

    if (chatbotWidget && !chatbotWidget.hidden) {
        const clickedInsideWidget = event.target.closest("#chatbotWidget");
        const clickedToggle = event.target.closest("#chatbotToggle");
        if (!clickedInsideWidget && !clickedToggle) {
            closeChatbot();
        }
    }
});

chatbotChips.forEach(chip => {
    chip.addEventListener("click", () => {
        const text = chip.textContent || "";
        openChatbot();
        addChatMessage("user", text);

        const typingIndicator = addTypingIndicator();
        getChatbotReply(text)
            .then(reply => addChatMessage("bot", reply))
            .finally(() => removeTypingIndicator(typingIndicator));
    });
});

chatbotForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!chatbotInput) {
        return;
    }

    const inputText = chatbotInput.value.trim();
    if (!inputText) {
        return;
    }

    addChatMessage("user", inputText);
    chatbotInput.value = "";

    if (inputText.toLowerCase() === "clear chat") {
        chatbotMessages.innerHTML = "";
        localStorage.removeItem(CHAT_HISTORY_KEY);
        chatHistoryRestored = true;
        addChatMessage("bot", "Chat cleared. How can I help with your project?");
        return;
    }

    const typingIndicator = addTypingIndicator();
    const reply = await getChatbotReply(inputText);
    removeTypingIndicator(typingIndicator);
    addChatMessage("bot", reply);
});

const yearNode = document.getElementById("year");
if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
}

backToTop?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

window.addEventListener("scroll", updateScrollUI, { passive: true });

window.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    if (chatbotWidget && !chatbotWidget.hidden) {
        closeChatbot();
    }

    const bookingModalNode = document.getElementById("bookingModal");
    if (bookingModalNode && !bookingModalNode.hidden) {
        bookingModalNode.hidden = true;
    }

    const certificationsModalNode = document.getElementById("certificationsModal");
    if (certificationsModalNode && !certificationsModalNode.hidden) {
        certificationsModalNode.hidden = true;
    }
});

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const canvas = document.getElementById("ink-canvas");

if (canvas && dot && ring && window.matchMedia("(min-width: 621px)").matches) {
    const context = canvas.getContext("2d");
    const particles = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function addParticle(x, y) {
        particles.push({
            x,
            y,
            life: 1,
            size: Math.random() * 8 + 4,
            driftX: (Math.random() - 0.5) * 1.2,
            driftY: (Math.random() - 0.5) * 1.2
        });

        if (particles.length > 80) {
            particles.shift();
        }
    }

    function drawInkTrail() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i -= 1) {
            const particle = particles[i];
            particle.life -= 0.02;
            particle.x += particle.driftX;
            particle.y += particle.driftY;
            particle.size *= 0.985;

            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            context.beginPath();
            context.fillStyle = `rgba(255,122,24,${particle.life * 0.6})`;
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        }

        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
        ring.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;

        requestAnimationFrame(drawInkTrail);
    }

    window.addEventListener("mousemove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        addParticle(mouseX, mouseY);
    });

    window.addEventListener("mousedown", () => {
        ring.style.transform += " scale(0.84)";
    });

    window.addEventListener("mouseup", () => {
        ring.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawInkTrail();
}

// Certifications Modal
const certViewBtn = document.getElementById("certViewBtn");
const certCloseBtn = document.getElementById("certCloseBtn");
const certificationsModal = document.getElementById("certificationsModal");

if (certViewBtn) {
    certViewBtn.addEventListener("click", () => {
        certificationsModal.hidden = false;
        loadCertificationsFromAdmin();
    });
}

if (certCloseBtn) {
    certCloseBtn.addEventListener("click", () => {
        certificationsModal.hidden = true;
    });
}

certificationsModal?.addEventListener("click", (e) => {
    if (e.target === certificationsModal) {
        certificationsModal.hidden = true;
    }
});

function loadCertificationsFromAdmin() {
    const certs = JSON.parse(localStorage.getItem("admin_certifications") || "[]");
    const grid = document.getElementById("certsGrid");
    if (grid) {
        if (!certs.length) {
            grid.innerHTML = "<p style='color: var(--muted); text-align: center;'>No certifications added yet.</p>";
            return;
        }
        grid.innerHTML = certs.map(cert => `
            <div class="cert-card">
                <i class="fa-solid fa-certificate"></i>
                <h4>${cert.title}</h4>
                <p>${cert.issuer}</p>
                <p class="cert-date">${new Date(cert.date).getFullYear()}</p>
                ${cert.description ? `<p style="font-size: 0.8rem; margin-top: 8px;">${cert.description}</p>` : ""}
            </div>
        `).join("");
    }
}

function highlightCert(element) {
    document.querySelectorAll(".cert-card").forEach(c => c.style.borderColor = "var(--line)");
    element.style.borderColor = "var(--brand)";
}

// Booking Modal System
const bookingModal = document.getElementById("bookingModal");
const bookingCloseBtn = document.getElementById("bookingCloseBtn");
const bookingForm = document.getElementById("bookingForm");
const bookingChatMessages = document.getElementById("bookingChatMessages");
const bookingChatForm = document.getElementById("bookingChatForm");
const bookingChatInput = document.getElementById("bookingChatInput");
const bookingTitle = document.getElementById("bookingTitle");
let currentBookingType = "";

function openBookingModal(type) {
    currentBookingType = type;
    bookingModal.hidden = false;
    bookingChatMessages.innerHTML = "";
    bookingForm.reset();
    
    if (type === "project") {
        bookingTitle.textContent = "Book Your Project";
        addBookingChatMessage("bot", "Welcome! Let's discuss your project requirements. What type of solution do you need?");
    } else if (type.startsWith("session")) {
        const sessionMap = {
            "session-30": "Free 30-Min Consultation",
            "session-60": "60-Minute Deep Dive",
            "session-team": "Team Workshop"
        };
        bookingTitle.textContent = `Book: ${sessionMap[type]}`;
        addBookingChatMessage("bot", `Great choice! Let me help you book the ${sessionMap[type]}. When would be convenient for you?`);
    }
}

if (bookingCloseBtn) {
    bookingCloseBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        bookingModal.hidden = true;
    });
}

const bookingDateInput = document.getElementById("bookingDate");
if (bookingDateInput) {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");
    bookingDateInput.min = `${today.getFullYear()}-${month}-${day}`;
}

bookingModal?.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
        bookingModal.hidden = true;
    }
});

function addBookingChatMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `booking-chat-bubble ${role}`;
    bubble.textContent = text;
    bookingChatMessages.appendChild(bubble);
    bookingChatMessages.scrollTop = bookingChatMessages.scrollHeight;
}

async function getBookingAssistantReply(message) {
    const text = message.toLowerCase();

    if (text.includes("full stack") || text.includes("website") || text.includes("web app")) {
        return "Full Stack is perfect! It includes frontend, backend, database, and deployment. Budget typically starts from $450. Would you like to proceed with booking?";
    }

    if (text.includes("ai") || text.includes("ml") || text.includes("machine learning")) {
        return "AI/ML solutions are great for data processing and automation. Typical investment starts from $500. Do you have specific data requirements?";
    }

    if (text.includes("automation") || text.includes("workflow")) {
        return "Automation can save you significant time! We can connect APIs, spreadsheets, and messaging tools. Let's discuss your specific workflow needs.";
    }

    if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
        return "Starter projects start from $50. Business Pro: $450-$900. Enterprise: $1200+. What's your budget range?";
    }

    if (text.includes("timeline") || text.includes("time")) {
        return "Small tasks: 2-4 days. Medium: 1-2 weeks. Large: 3-6 weeks. When do you need this completed?";
    }

    if (text.includes("yes") || text.includes("confirm") || text.includes("proceed")) {
        return "Perfect! Your booking details have been saved. I'll follow up with you soon. Thank you!";
    }

    return "I'm here to help! Ask me about services, pricing, timeline, or any project details. What can I help with?";
}

bookingChatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const inputText = bookingChatInput.value.trim();
    if (!inputText) return;

    addBookingChatMessage("user", inputText);
    bookingChatInput.value = "";

    const reply = await getBookingAssistantReply(inputText);
    setTimeout(() => {
        addBookingChatMessage("bot", reply);
    }, 300);
});

bookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        type: currentBookingType,
        sessionType: currentBookingType.replace("session-", "") || "custom",
        name: document.getElementById("bookingName").value.trim(),
        email: document.getElementById("bookingEmail").value.trim(),
        phone: document.getElementById("bookingPhone").value.trim(),
        date: document.getElementById("bookingDate").value,
        time: document.getElementById("bookingTime").value,
        budget: document.getElementById("bookingBudget").value,
        details: document.getElementById("bookingDetails").value.trim(),
        timestamp: new Date().toISOString()
    };

    if (!data.name || !data.email || !data.date || !data.time || !data.details) {
        document.getElementById("bookingStatus").textContent = "Please fill all required fields.";
        document.getElementById("bookingStatus").className = "booking-status error";
        return;
    }

    if (!validEmail(data.email)) {
        document.getElementById("bookingStatus").textContent = "Please enter a valid email address.";
        document.getElementById("bookingStatus").className = "booking-status error";
        return;
    }

    const selectedDateTime = new Date(`${data.date}T${data.time}`);
    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime < new Date()) {
        document.getElementById("bookingStatus").textContent = "Please choose a future date and time.";
        document.getElementById("bookingStatus").className = "booking-status error";
        return;
    }

    let bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    bookings.push(data);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    document.getElementById("bookingStatus").textContent = "✓ Booking confirmed! Check your email for details.";
    document.getElementById("bookingStatus").className = "booking-status success";
    
    addBookingChatMessage("bot", "Excellent! Your booking has been confirmed. I'll send you a confirmation email shortly. Looking forward to working with you!");

    setTimeout(() => {
        bookingForm.reset();
        document.getElementById("bookingStatus").textContent = "";
    }, 3000);
});
