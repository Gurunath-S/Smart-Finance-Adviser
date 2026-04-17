import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { signout } from '../../utils/Icons';
import { menuItems } from '../../utils/menuItems';
import { useGlobalContext } from '../../context/globalContext';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import {
    FiPieChart, FiUser, FiSun, FiMoon, FiLogOut
} from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Navigation({ active, setActive }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const { totalIncome, darkMode, toggleDarkMode } = useGlobalContext();

    useEffect(() => {
        const saved = localStorage.getItem("username");
        setUsername(saved || "Guest");

        // Fetch current user info to get avatar
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${API_BASE}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => { if (data.avatar) setAvatarUrl(data.avatar); })
                .catch(() => { });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <NavStyled
            as={motion.nav}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 60 }}
        >
            <motion.div
                className="user-con"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setActive(7)}
                title="Edit Profile"
            >
                <div className="avatar-wrap">
                    {avatarUrl
                        ? <img src={`${API_BASE}${avatarUrl}`} alt="avatar" className="avatar-img" />
                        : <div className="avatar-initial">{username ? username[0].toUpperCase() : 'U'}</div>
                    }
                </div>
                <div className="text">
                    <h2>{username}</h2>
                    <p>₹{totalIncome()}</p>
                </div>
            </motion.div>

            <motion.ul
                className="menu-items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {menuItems.map((item) => (
                    <motion.li
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        className={active === item.id ? 'active' : ''}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.01 }}
                    >
                        {item.icon}
                        <span>{item.title}</span>
                    </motion.li>
                ))}
            </motion.ul>

            <motion.div
                className="bottom-nav"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <motion.li
                    onClick={() => setActive(6)}
                    className={`menu-item-extra ${active === 6 ? 'active' : ''}`}
                    whileHover={{ scale: 1.04 }}
                >
                    <FiPieChart size={18} />
                    <span>Budget</span>
                </motion.li>
                <motion.li
                    onClick={() => setActive(7)}
                    className={`menu-item-extra ${active === 7 ? 'active' : ''}`}
                    whileHover={{ scale: 1.04 }}
                >
                    <FiUser size={18} />
                    <span>Profile</span>
                </motion.li>

                <div className="bottom-actions">
                    <button className="dark-toggle" onClick={toggleDarkMode} title="Toggle dark mode">
                        {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                        <span>{darkMode ? 'Light' : 'Dark'}</span>
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.div>
        </NavStyled>
    );
}

const NavStyled = styled(motion.nav)`
    background: var(--nav-bg);
    padding: 2rem 1.5rem;
    width: 374px;
    height: 100%;
    border: 3px solid var(--border-color);
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
    transition: background 0.3s, border-color 0.3s;

    .user-con {
        height: 100px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        border-radius: 16px;
        padding: 0.5rem;
        transition: background 0.2s;
        &:hover { background: var(--nav-hover-bg); }

        .avatar-wrap {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid var(--border-color);
            box-shadow: 0px 1px 17px rgba(0, 0, 0, 0.1);
        }

        .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .avatar-initial {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
            color: #FFD700;
            font-size: 2rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        h2 { color: var(--nav-text-active); font-size: 1.1rem; }
        p  { color: var(--nav-text); font-size: 0.85rem; }
    }

    .menu-items {
        flex: 1;
        display: flex;
        flex-direction: column;
        li {
            display: grid;
            grid-template-columns: 40px auto;
            align-items: center;
            margin: 0.5rem 0;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--nav-text);
            padding: 0.5rem 1rem;
            border-radius: 12px;
            position: relative;
            &:hover { background: var(--nav-hover-bg); color: var(--nav-text-active); }
            svg, img { color: var(--nav-text); }
        }
    }

    .active {
        color: var(--nav-text-active) !important;
        background: var(--nav-hover-bg);
        svg { color: var(--nav-text-active) !important; }
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: var(--nav-active-bar);
            border-radius: 0 4px 4px 0;
        }
    }

    .bottom-nav {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .menu-item-extra {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.6rem 1rem;
            cursor: pointer;
            border-radius: 12px;
            color: var(--nav-text);
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s;
            list-style: none;
            &.active { color: var(--nav-text-active); background: var(--nav-hover-bg); font-weight: 700; }
            &:hover { color: var(--nav-text-active); background: var(--nav-hover-bg); }
        }

        .bottom-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        button {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            padding: 0.7rem 1rem;
            border: 1px solid var(--border-light);
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            background: var(--bg-card);
            color: var(--text-primary);
            &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            &:active { transform: scale(0.97); }
        }

        .dark-toggle {
            background: var(--bg-card);
            color: var(--text-primary);
        }

        .logout-btn {
            background: rgba(245, 102, 146, 0.1);
            color: #F56692;
            border-color: rgba(245, 102, 146, 0.3);
            &:hover { background: #F56692; color: white; }
        }
    }
`;

export default Navigation;
