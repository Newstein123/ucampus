<!DOCTYPE html>

<html @class([ 'dark']) lang="en">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Terms and Conditions | U Camp</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&amp;family=Noto+Sans:wght@100..900&amp;display=swap" rel="stylesheet" />
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
                <a href="/landing" @class([ 'flex', 'items-center', 'gap-2'])>
                    <img src="{{ asset('assets/images/logo.png') }}" alt="U Camp Logo" class="w-6 h-6">
                    <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'leading-tight', 'tracking-[-0.015em]'])>U Camp</h2>
                </a>
            </div>
            <div @class([ 'flex', 'items-center'])>
                <a href="/landing" @class([ 'text-white/70', 'hover:text-primary', 'transition-colors', 'text-sm', 'font-medium'])>Back to Home</a>
            </div>
        </div>
    </nav>
    
    <!-- Terms and Conditions Content -->
    <main @class([ 'py-12', 'px-4', 'max-w-4xl', 'mx-auto'])>
        <div @class([ 'bg-white/5', 'border', 'border-white/10', 'rounded-2xl', 'p-8', 'md:p-12'])>
            <div @class([ 'flex', 'flex-col', 'gap-6'])>
                <div @class([ 'flex', 'flex-col', 'gap-2'])>
                    <h1 @class([ 'text-white', 'text-3xl', 'md:text-4xl', 'font-bold', 'leading-tight', 'tracking-[-0.015em]'])>U Campus – Terms and Conditions</h1>
                    <p @class([ 'text-white/50', 'text-sm', 'font-medium'])>Last updated: June 25, 2025</p>
                </div>
                
                <div @class([ 'text-white/70', 'text-base', 'leading-relaxed', 'mb-6'])>
                    <p @class([ 'mb-4'])>Welcome to U Campus – a platform built for students and young creatives to share IT ideas, ask questions, exchange opinions, and learn together. Please read these Terms and Conditions ("Terms") carefully before using the U Campus app or website.</p>
                    <p @class([ 'font-semibold', 'text-white', 'mb-2'])>By using U Campus, you agree to follow these Terms, including:</p>
                </div>
                
                <div @class([ 'space-y-6'])>
                    <!-- Who Can Use U Campus -->
                    <div>
                        <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'mb-3'])>Who Can Use U Campus</h2>
                        <ul @class([ 'list-disc', 'list-inside', 'space-y-2', 'text-white/70', 'text-base', 'leading-relaxed', 'pl-4'])>
                            <li>You must be 13 years or older to use U Campus. If you are under 18, please get permission from a parent or guardian.</li>
                            <li>You must create an account with accurate information and keep your login details private.</li>
                        </ul>
                    </div>
                    
                    <!-- What You Can Post -->
                    <div>
                        <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'mb-3'])>What You Can Post</h2>
                        <ul @class([ 'list-disc', 'list-inside', 'space-y-2', 'text-white/70', 'text-base', 'leading-relaxed', 'pl-4'])>
                            <li>Your welcome post</li>
                            <li>Ideas, questions, and projects related to technology, design, and innovation</li>
                            <li>Resources (tools, links, templates) that help others</li>
                            <li>Kind feedback, likes, respectful comments, and collaborative requests</li>
                        </ul>
                    </div>
                    
                    <!-- What You Cannot Post -->
                    <div>
                        <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'mb-3'])>What You Cannot Post</h2>
                        <ul @class([ 'list-disc', 'list-inside', 'space-y-2', 'text-white/70', 'text-base', 'leading-relaxed', 'pl-4'])>
                            <li>Hate speech, abuse, or hateful content</li>
                            <li>Spam, advertising, or misleading information</li>
                            <li>Material you don't own or lack rights</li>
                            <li>Content that violates our values or users who break these rules</li>
                        </ul>
                    </div>
                    
                    <!-- Uploads and Attachments -->
                    <div>
                        <h2 @class([ 'text-white', 'text-xl', 'font-bold', 'mb-3'])>Uploads and Attachments</h2>
                        <p @class([ 'text-white/70', 'text-base', 'leading-relaxed'])>You're responsible for what you upload. Only share files you own or control. You must have permission to use any content you upload. We may remove content that violates these Terms.</p>
                    </div>
                </div>
                
                <div @class([ 'pt-6', 'mt-6', 'border-t', 'border-white/10'])>
                    <p @class([ 'text-white/40', 'text-xs', 'font-medium'])>Last updated: June 25, 2025</p>
                </div>
            </div>
        </div>
    </main>
    
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
                <a @class([ 'hover:text-primary', 'transition-colors']) href="/landing">Home</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">About</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">Curriculum</a>
                <a @class([ 'hover:text-primary', 'transition-colors']) href="#">Community</a>
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

