<!DOCTYPE html>

<html @class([ 'dark']) lang="en">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>U Camp | Learn by Asking</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&amp;family=Noto+Sans:wght@100..900&amp;display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#22c55e",
                        "background-light": "#ffffff",
                        "background-dark": "#0f172a",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
    <style>
        body {
            font-family: 'Lexend', sans-serif;
        }
        .glass-nav {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
    </style>
    <style>
        body {
          min-height: max(884px, 100dvh);
        }
    </style>
</head>

<body @class([ 'bg-background-light', 'dark:bg-background-dark', 'text-slate-900', 'dark:text-white', 'antialiased'])>
    <!-- TopAppBar -->
    <nav @class([ 'sticky', 'top-0', 'z-50', 'glass-nav', 'border-b', 'border-white/5'])>
        <div @class([ 'flex', 'items-center', 'p-4', 'justify-between', 'max-w-screen-xl', 'mx-auto'])>
            <div @class([ 'flex', 'items-center', 'gap-2'])>
                <img src="{{ asset('assets/images/logo.png') }}" alt="U Camp Logo" class="w-6 h-6">
                <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'leading-tight', 'tracking-[-0.015em]'])>U Camp</h2>
            </div>
            <div @class([ 'flex', 'items-center'])>
                <button @class([ 'bg-primary/20', 'text-primary', 'border', 'border-primary/30', 'px-4', 'py-1.5', 'rounded-full', 'text-sm', 'font-bold', 'tracking-tight'])>
                    Get Started
                </button>
            </div>
        </div>
    </nav>
    <!-- HeroSection -->
    <main @class([ 'relative', 'overflow-hidden'])>
        <div @class([ 'absolute', 'top-0', 'left-1/2', '-translate-x-1/2', 'w-full', 'h-[500px]', 'bg-primary/10', 'blur-[120px]', 'rounded-full', 'pointer-events-none'])></div>
        <div @class([ '@container', 'max-w-screen-xl', 'mx-auto'])>
            <div @class([ 'flex', 'flex-col', 'gap-6', 'px-4', 'py-12', '@[480px]:gap-12', '@[864px]:flex-row', '@[864px]:items-center'])>
                <div @class([ 'w-full', 'relative', 'aspect-video', 'bg-cover', 'rounded-xl', 'overflow-hidden', '@[480px]:h-auto', '@[480px]:min-w-[400px]', '@[864px]:w-1/2', 'shadow-2xl', 'shadow-primary/20']) data-alt="Modern collaborative workspace with diverse people learning"
                style='background-image: url("assets/images/hero-image.png");'>
                    <div @class([ 'absolute', 'inset-0', 'bg-gradient-to-t', 'from-background-dark/80', 'to-transparent'])></div>
                </div>
                <div @class([ 'flex', 'flex-col', 'gap-8', '@[480px]:min-w-[400px]', '@[864px]:w-1/2'])>
                    <div @class([ 'flex', 'flex-col', 'gap-4'])>
                        <div @class([ 'inline-flex', 'w-fit', 'items-center', 'gap-2', 'bg-white/5', 'border', 'border-white/10', 'px-3', 'py-1', 'rounded-full'])>
                            <span @class([ 'material-symbols-outlined', 'text-primary', 'text-sm'])>auto_awesome</span>
                            <span @class([ 'text-xs', 'font-medium', 'text-white/70', 'uppercase', 'tracking-widest'])>New Learning Era</span>
                        </div>
                        <h1 @class([ 'text-white', 'text-4xl', 'font-black', 'leading-tight', 'tracking-[-0.033em]', '@[480px]:text-6xl'])>
                            Learn by Asking.<br/><span @class(['text-primary'])>Grow by Sharing.</span>
</h1>
                        <p @class([ 'text-white/70', 'text-base', 'font-normal', 'leading-relaxed', '@[480px]:text-lg', 'max-w-xl'])>
                            A curiosity-driven, open knowledge and learning platform for turning questions into real-world impact. Join a global community of thinkers and doers.
                        </p>
                    </div>
                    <div @class([ 'flex', 'flex-col', 'sm:flex-row', 'gap-4'])>
                        <button @class([ 'flex', 'items-center', 'justify-center', 'rounded-xl', 'h-14', 'px-8', 'bg-primary', 'text-white', 'text-base', 'font-bold', 'shadow-lg', 'shadow-primary/25', 'hover:scale-[1.02]', 'transition-transform'])>
                            <a href="/">Explore U Camp</a>
                        </button>
                        <button @class([ 'flex', 'items-center', 'justify-center', 'rounded-xl', 'h-14', 'px-8', 'bg-white/5', 'border', 'border-white/10', 'text-white', 'text-base', 'font-bold', 'hover:bg-white/10', 'transition-colors'])>
                            <a href="/signup">Become a Contributor</a>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <!-- Why U Camp / SectionHeader & BodyText -->
    <section @class([ 'py-12', 'px-4', 'max-w-screen-xl', 'mx-auto'])>
        <div @class([ 'bg-white/5', 'border', 'border-white/10', 'rounded-2xl', 'p-8', '@container'])>
            <div @class([ 'flex', 'flex-col', '@[600px]:flex-row', 'gap-8', 'items-start'])>
                <div @class([ 'flex-1'])>
                    <h2 @class([ 'text-white', 'text-[32px]', 'font-bold', 'leading-tight', 'tracking-[-0.015em]', 'mb-4'])>Why U Camp?</h2>
                    <p @class([ 'text-white/70', 'text-lg', 'leading-relaxed', 'max-w-2xl'])>
                        Bridging the gap between curiosity and real-world impact through collaborative learning and open knowledge. We believe the best way to learn is to solve real problems together.
                    </p>
                </div>
                <div @class([ 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4', 'w-full', '@[600px]:w-auto'])>
                    <div @class([ 'p-4', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-2'])>moving</span>
                        <h4 @class([ 'text-white', 'font-bold'])>Active Learning</h4>
                        <p @class([ 'text-white/50', 'text-xs'])>No passive lectures.</p>
                    </div>
                    <div @class([ 'p-4', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-2'])>groups</span>
                        <h4 @class([ 'text-white', 'font-bold'])>Community-led</h4>
                        <p @class([ 'text-white/50', 'text-xs'])>Knowledge is shared.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- How it Works -->
    <section @class([ 'py-16', 'px-4', 'max-w-screen-xl', 'mx-auto'])>
        <div @class([ 'text-center', 'mb-12'])>
            <h2 @class([ 'text-white', 'text-3xl', 'font-bold', 'tracking-tight', 'mb-4'])>How it Works</h2>
            <div @class([ 'h-1', 'w-20', 'bg-primary', 'mx-auto', 'rounded-full'])></div>
        </div>
        <div @class([ 'relative', 'flex', 'flex-col', 'gap-12', 'max-w-md', 'mx-auto'])>
            <!-- Timeline Line -->
            <div @class([ 'absolute', 'left-[27px]', 'top-4', 'bottom-4', 'w-0.5', 'bg-gradient-to-b', 'from-primary/50', 'via-primary/20', 'to-transparent'])></div>
            <!-- Step 1 -->
            <div @class([ 'flex', 'gap-6', 'relative', 'group'])>
                <div @class([ 'z-10', 'flex', 'size-14', 'shrink-0', 'items-center', 'justify-center', 'rounded-full', 'bg-background-dark', 'border-2', 'border-primary', 'text-primary', 'shadow-[0_0_15px_rgba(34,197,94,0.3)]'])>
                    <span @class([ 'material-symbols-outlined'])>lightbulb</span>
                </div>
                <div @class([ 'pt-2'])>
                    <h3 @class([ 'text-white', 'text-xl', 'font-bold'])>Start</h3>
                    <p @class([ 'text-white/60', 'text-base'])>Bring your burning questions and curiosity to the platform.</p>
                </div>
            </div>
            <!-- Step 2 -->
            <div @class([ 'flex', 'gap-6', 'relative'])>
                <div @class([ 'z-10', 'flex', 'size-14', 'shrink-0', 'items-center', 'justify-center', 'rounded-full', 'bg-background-dark', 'border-2', 'border-primary/40', 'text-primary/40'])>
                    <span @class([ 'material-symbols-outlined'])>search</span>
                </div>
                <div @class([ 'pt-2'])>
                    <h3 @class([ 'text-white', 'text-xl', 'font-bold'])>Explore</h3>
                    <p @class([ 'text-white/60', 'text-base'])>Discover open knowledge paths and existing solutions from the community.</p>
                </div>
            </div>
            <!-- Step 3 -->
            <div @class([ 'flex', 'gap-6', 'relative'])>
                <div @class([ 'z-10', 'flex', 'size-14', 'shrink-0', 'items-center', 'justify-center', 'rounded-full', 'bg-background-dark', 'border-2', 'border-primary/40', 'text-primary/40'])>
                    <span @class([ 'material-symbols-outlined'])>edit_note</span>
                </div>
                <div @class([ 'pt-2'])>
                    <h3 @class([ 'text-white', 'text-xl', 'font-bold'])>Contribute</h3>
                    <p @class([ 'text-white/60', 'text-base'])>Share your expertise and help others solve complex challenges.</p>
                </div>
            </div>
            <!-- Step 4 -->
            <div @class([ 'flex', 'gap-6', 'relative'])>
                <div @class([ 'z-10', 'flex', 'size-14', 'shrink-0', 'items-center', 'justify-center', 'rounded-full', 'bg-background-dark', 'border-2', 'border-primary/40', 'text-primary/40'])>
                    <span @class([ 'material-symbols-outlined'])>rocket_launch</span>
                </div>
                <div @class([ 'pt-2'])>
                    <h3 @class([ 'text-white', 'text-xl', 'font-bold'])>Apply</h3>
                    <p @class([ 'text-white/60', 'text-base'])>Turn that collective knowledge into tangible real-world projects.</p>
                </div>
            </div>
        </div>
    </section>
    <!-- Value Props Grid -->
    <section @class([ 'py-16', 'px-4', 'bg-white/5', 'border-y', 'border-white/5'])>
        <div @class([ 'max-w-screen-xl', 'mx-auto'])>
            <h2 @class([ 'text-white', 'text-[22px]', 'font-bold', 'leading-tight', 'tracking-[-0.015em]', 'mb-8'])>Our Core Principles</h2>
            <div @class([ 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-6'])>
                <div @class([ 'p-6', 'rounded-2xl', 'bg-background-dark/80', 'border', 'border-white/10', 'hover:border-primary/50', 'transition-colors'])>
                    <span @class([ 'material-symbols-outlined', 'text-primary', 'text-3xl', 'mb-4'])>psychology</span>
                    <h3 @class([ 'text-white', 'font-bold', 'text-lg', 'mb-2'])>Curiosity-First</h3>
                    <p @class([ 'text-white/50', 'text-sm'])>Everything starts with a "Why". We value questions as much as answers.</p>
                </div>
                <div @class([ 'p-6', 'rounded-2xl', 'bg-background-dark/80', 'border', 'border-white/10', 'hover:border-primary/50', 'transition-colors'])>
                    <span @class([ 'material-symbols-outlined', 'text-primary', 'text-3xl', 'mb-4'])>handshake</span>
                    <h3 @class([ 'text-white', 'font-bold', 'text-lg', 'mb-2'])>Collaborative</h3>
                    <p @class([ 'text-white/50', 'text-sm'])>Learning is social. Build on the shoulders of giants and peers.</p>
                </div>
                <div @class([ 'p-6', 'rounded-2xl', 'bg-background-dark/80', 'border', 'border-white/10', 'hover:border-primary/50', 'transition-colors'])>
                    <span @class([ 'material-symbols-outlined', 'text-primary', 'text-3xl', 'mb-4'])>public</span>
                    <h3 @class([ 'text-white', 'font-bold', 'text-lg', 'mb-2'])>Open Knowledge</h3>
                    <p @class([ 'text-white/50', 'text-sm'])>Access to information is a right. All our paths are open-source.</p>
                </div>
                <div @class([ 'p-6', 'rounded-2xl', 'bg-background-dark/80', 'border', 'border-white/10', 'hover:border-primary/50', 'transition-colors'])>
                    <span @class([ 'material-symbols-outlined', 'text-primary', 'text-3xl', 'mb-4'])>next_plan</span>
                    <h3 @class([ 'text-white', 'font-bold', 'text-lg', 'mb-2'])>Active Impact</h3>
                    <p @class([ 'text-white/50', 'text-sm'])>Knowledge is useless without action. We focus on real-world outcomes.</p>
                </div>
            </div>
        </div>
    </section>
    <!-- PWA Section -->
    <section @class([ 'py-16', 'px-4', 'max-w-screen-xl', 'mx-auto'])>
        <div @class([ 'bg-gradient-to-br', 'from-primary/20', 'to-transparent', 'border', 'border-primary/30', 'rounded-3xl', 'p-8', 'flex', 'flex-col', 'md:flex-row', 'items-center', 'gap-8'])>
            <div @class([ 'flex-1'])>
                <div @class([ 'flex', 'items-center', 'gap-2', 'mb-4'])>
                    <span @class([ 'material-symbols-outlined', 'text-primary'])>install_mobile</span>
                    <span @class([ 'text-primary', 'font-bold', 'uppercase', 'tracking-widest', 'text-xs'])>PWA Enabled</span>
                </div>
                <h2 @class([ 'text-white', 'text-3xl', 'font-bold', 'mb-4'])>Works on Any Device</h2>
                <p @class([ 'text-white/70', 'text-lg', 'mb-6'])>Install U Camp directly from your browser. No app store needed, works offline, and keeps you updated with instant notifications.</p>
                <button @class([ 'bg-white', 'text-background-dark', 'px-6', 'py-3', 'rounded-xl', 'font-bold', 'inline-flex', 'items-center', 'gap-2', 'hover:bg-white/90', 'transition-colors'])>
                    <span @class([ 'material-symbols-outlined'])>add_to_home_screen</span> Add to Home Screen
                </button>
            </div>
            <div @class([ 'w-full', 'max-w-[280px]', 'aspect-[9/19]', 'bg-background-dark', 'rounded-[3rem]', 'border-8', 'border-white/10', 'overflow-hidden', 'relative', 'shadow-2xl'])>
                <div @class([ 'absolute', 'inset-0', 'bg-primary/10'])></div>
                <!-- Mockup Content -->
                <div @class([ 'p-6'])>
                    <div @class([ 'h-4', 'w-20', 'bg-white/10', 'rounded-full', 'mb-8'])></div>
                    <div @class([ 'h-8', 'w-32', 'bg-primary/40', 'rounded-lg', 'mb-4'])></div>
                    <div @class([ 'space-y-3'])>
                        <div @class([ 'h-3', 'w-full', 'bg-white/5', 'rounded-full'])></div>
                        <div @class([ 'h-3', 'w-full', 'bg-white/5', 'rounded-full'])></div>
                        <div @class([ 'h-3', 'w-2/3', 'bg-white/5', 'rounded-full'])></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Vision & Future Direction -->
    <section @class([ 'py-16', 'px-4', 'max-w-screen-xl', 'mx-auto'])>
        <div @class([ 'bg-white/5', 'border', 'border-white/10', 'rounded-2xl', 'p-8', '@container'])>
            <div @class([ 'flex', 'flex-col', 'gap-8'])>
                <div @class([ 'flex', 'flex-col', 'gap-4'])>
                    <h2 @class([ 'text-white', 'text-[32px]', 'font-bold', 'leading-tight', 'tracking-[-0.015em]', 'mb-2'])>Vision & Future Direction</h2>
                    <p @class([ 'text-white/70', 'text-lg', 'leading-relaxed', 'max-w-3xl'])>
                        U Camp starts simple — and grows responsibly.
                    </p>
                    <p @class([ 'text-white/70', 'text-base', 'leading-relaxed', 'max-w-3xl', 'mt-2'])>
                        In the future, U Camp aims to support:
                    </p>
                </div>
                <div @class([ 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-4', 'mt-4'])>
                    <div @class([ 'p-5', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/30', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-2xl'])>route</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Structured Research & Learning Paths</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>Organized pathways for systematic learning and research exploration.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/30', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-2xl'])>description</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Public Research Outputs</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>Educational resources and research findings available to all.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/30', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-2xl'])>payments</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Funding Requests</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>Support learning and research initiatives through transparent funding.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/50', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/30', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-2xl'])>lock_open</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Ethical Collaboration</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>Open knowledge without paywalls — accessible to everyone.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Open Knowledge & Public Impact -->
    <section @class([ 'py-16', 'px-4', 'max-w-screen-xl', 'mx-auto'])>
        <div @class([ 'bg-gradient-to-br', 'from-primary/10', 'to-transparent', 'border', 'border-primary/20', 'rounded-2xl', 'p-8', '@container'])>
            <div @class([ 'flex', 'flex-col', 'gap-8'])>
                <div @class([ 'flex', 'flex-col', 'gap-4'])>
                    <div @class([ 'flex', 'items-center', 'gap-2', 'mb-2'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary'])>public</span>
                        <h2 @class([ 'text-white', 'text-[32px]', 'font-bold', 'leading-tight', 'tracking-[-0.015em]'])>Open Knowledge & Public Impact</h2>
                    </div>
                    <p @class([ 'text-white/70', 'text-lg', 'leading-relaxed', 'max-w-3xl'])>
                        Knowledge created on U Camp is meant to be shared.
                    </p>
                    <p @class([ 'text-white/70', 'text-base', 'leading-relaxed', 'max-w-3xl', 'mt-2'])>
                        U Camp is being built as:
                    </p>
                </div>
                <div @class([ 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-4', 'mt-4'])>
                    <div @class([ 'p-5', 'bg-background-dark/60', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/40', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-3xl'])>menu_book</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Public Knowledge Library</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>A comprehensive repository of accessible learning resources.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/60', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/40', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-3xl'])>science</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Open Research Space</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>A platform for transparent research and shared resources.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/60', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/40', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-3xl'])>handshake</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Funding for Learning</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>Where funding supports education — not control.</p>
                    </div>
                    <div @class([ 'p-5', 'bg-background-dark/60', 'rounded-xl', 'border', 'border-white/5', 'hover:border-primary/40', 'transition-colors'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'mb-3', 'text-3xl'])>timeline</span>
                        <h4 @class([ 'text-white', 'font-bold', 'text-base', 'mb-2'])>Long-term Contribution</h4>
                        <p @class([ 'text-white/50', 'text-sm', 'leading-relaxed'])>A lasting impact on society, across generations.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Footer -->
    <footer @class([ 'pt-20', 'pb-10', 'px-4', 'border-t', 'border-white/5'])>
        <div @class([ 'max-w-screen-xl', 'mx-auto', 'flex', 'flex-col', 'items-center', 'gap-8', 'text-center'])>
            <div @class([ 'flex', 'flex-col', 'items-center', 'gap-4'])>
                <div @class([ 'flex', 'items-center', 'gap-2'])>
                    <div @class([ 'bg-primary/20', 'rounded-lg', 'p-1.5', 'flex', 'items-center', 'justify-center'])>
                        <span @class([ 'material-symbols-outlined', 'text-primary', 'text-[20px]'])>school</span>
                    </div>
                    <h2 @class([ 'text-white', 'text-lg', 'font-bold', 'leading-tight', 'tracking-[-0.015em]'])>U Camp</h2>
                </div>
                <p @class([ 'text-white/40', 'text-sm', 'max-w-xs'])>An open learning ecosystem built for the next generation of creators.</p>
            </div>
            <div @class([ 'flex', 'flex-wrap', 'justify-center', 'gap-8', 'text-sm', 'font-medium', 'text-white/60'])>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">About</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">Curriculum</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">Community</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="/terms-and-conditions">Terms & Conditions</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">Privacy</a>
            </div>
            <div @class([ 'pt-8', 'w-full', 'border-t', 'border-white/5'])>
                <p @class([ 'text-white/20', 'text-xs', 'font-bold', 'tracking-widest', 'uppercase'])>
                    Powered by <span @class([ 'text-white/40'])>CodeArtisan</span>
                </p>
            </div>
        </div>
    </footer>
</body>

</html>