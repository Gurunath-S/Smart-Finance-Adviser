import {createGlobalStyle} from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
    }

    :root{
        --primary-color: #222260;
        --primary-color2: rgba(34, 34, 96, 0.6);
        --primary-color3: rgba(34, 34, 96, 0.4);
        --color-green: #10b981;
        --color-grey: #94a3b8;
        --color-accent: #ec4899;
        --color-delete: #ef4444;
        --color-indigo: #6366f1;
        --color-violet: #8b5cf6;
        --bg-glass: rgba(255, 255, 255, 0.75);
        --border-glass: 1.5px solid rgba(255, 255, 255, 0.9);
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
        --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.08);
    }

    ::selection {
        background: #e0e7ff;
        color: #4338ca;
    }

    body{
        font-family: 'Nunito', sans-serif;
        font-size: clamp(0.9rem, 1.5vw, 1.2rem);
        overflow-x: hidden;
        overflow-y: auto;
        color: rgba(34, 34, 96, .75);
        min-height: 100vh;
        -webkit-tap-highlight-color: transparent;
        background: linear-gradient(135deg, #fce4ec 0%, #ede7f6 50%, #e0f2fe 100%);
        background-attachment: fixed;
    }

    h1, h2, h3, h4, h5, h6{
        color: var(--primary-color);
    }

    .error{
        color: red;
        animation: shake 0.5s ease-in-out;
        @keyframes shake {
            0%{
                transform: translateX(0);
            }
            25%{
                transform: translateX(10px);
            }
            50%{
                transform: translateX(-10px);
            }
            75%{
                transform: translateX(10px);
            }
            100%{
                transform: translateX(0);
            }
        }
    }
`;