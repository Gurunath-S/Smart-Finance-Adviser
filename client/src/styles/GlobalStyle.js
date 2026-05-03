import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
    }

    /* ── Light mode variables (default) ── */
    :root {
        --primary-color: #222260;
        --color-green: #42AD00;
        --color-grey: #aaa;
        --color-accent: #F56692;
        --color-delete: #FF0000;

        /* Backgrounds */
        --bg-body:        rgba(250, 229, 250, 0.6);
        --bg-card:        #FCF6F9;
        --bg-glass:       rgba(250, 229, 250, 0.6);
        --bg-input:       #ffffff;

        /* Text */
        --text-heading:   rgba(34, 34, 96, 1);
        --text-primary:   rgba(34, 34, 96, 0.6);
        --text-secondary: rgba(34, 34, 96, 0.4);
        --text-muted:     #888;

        /* Borders */
        --border-color:   #FFFFFF;
        --border-light:   #e0e0e0;

        /* Sidebar */
        --nav-bg:         rgba(250, 229, 250, 0.6);
        --nav-text:       rgba(34, 34, 96, 0.6);
        --nav-text-active: rgba(34, 34, 96, 1);
        --nav-active-bar: #222260;
        --nav-hover-bg:   rgba(255,255,255,0.4);

        /* Main panel */
        --main-bg:        rgba(250, 229, 250, 0.6);
        --main-border:    #FFFFFF;
    }

    /* ── Dark mode variables ── */
    .dark-mode {
        --primary-color: #8888cc;
        --color-green: #4ade80;

        /* Backgrounds */
        --bg-body:        #0f0f1a;
        --bg-card:        #1c1c32;
        --bg-glass:       rgba(20, 20, 45, 0.85);
        --bg-input:       #252545;

        /* Text */
        --text-heading:   #d8d8ff;
        --text-primary:   #b0b0d8;
        --text-secondary: #8080b0;
        --text-muted:     #6060a0;

        /* Borders */
        --border-color:   rgba(255,255,255,0.07);
        --border-light:   rgba(255,255,255,0.1);

        /* Sidebar */
        --nav-bg:         rgba(18, 18, 38, 0.9);
        --nav-text:       #9090c0;
        --nav-text-active: #d8d8ff;
        --nav-active-bar: #8888cc;
        --nav-hover-bg:   rgba(255,255,255,0.06);

        /* Main panel */
        --main-bg:        rgba(18, 18, 38, 0.85);
        --main-border:    rgba(255,255,255,0.07);
    }

    body {
        font-family: 'Nunito', sans-serif;
        font-size: clamp(1rem, 1.5vw, 1.2rem);
        overflow: hidden;
        color: var(--text-primary);
        background: var(--bg-body);
        transition: background 0.3s ease, color 0.3s ease;
    }

    h1, h2, h3, h4, h5, h6 {
        color: var(--text-heading);
    }

    input, select, textarea {
        background: var(--bg-input);
        color: var(--text-heading);
        border-color: var(--border-light);
        transition: background 0.3s, color 0.3s, border-color 0.3s;
    }

    .error {
        color: red;
        animation: shake 0.5s ease-in-out;
        @keyframes shake {
            0%   { transform: translateX(0); }
            25%  { transform: translateX(10px); }
            50%  { transform: translateX(-10px); }
            75%  { transform: translateX(10px); }
            100% { transform: translateX(0); }
        }
    }
`;