import React, { useEffect, useState, useRef } from "react";
import styled from 'styled-components';
import defaultAvatar from '../../img/avatar.png';
import { signout } from '../../utils/Icons';
import { menuItems } from '../../utils/menuItems';
import { useGlobalContext } from '../../context/globalContext';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function Navigation({ active, setActive }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
    const [errorMsg, setErrorMsg] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef(null);
    const { totalIncome, logoutSession } = useGlobalContext();

    useEffect(() => {
        const savedUsername = localStorage.getItem("username");
        setUsername(savedUsername || "Guest"); 
        
        const savedImage = localStorage.getItem("profileImage");
        if (savedImage) {
            setAvatarUrl(savedImage.startsWith("http") ? savedImage : `${API_BASE_URL.replace("/api", "")}${savedImage}`);
        } else {
            setAvatarUrl(defaultAvatar);
        }
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/users/update-profile-image`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const newPath = response.data.profileImage;
            localStorage.setItem("profileImage", newPath);
            setAvatarUrl(newPath.startsWith("http") ? newPath : `${API_BASE_URL.replace("/api", "")}${newPath}`);
        } catch (error) {
            console.error("Error updating profile image", error);
            const msg = error.response?.data?.message || "Cloud upload failed. Check keys.";
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
        }
    };

    const role = localStorage.getItem("role");

    const handleLogout = async () => {
        if (logoutSession) {
            await logoutSession();
        } else {
            localStorage.removeItem('token'); 
            localStorage.removeItem("username");
            localStorage.removeItem("profileImage");
            localStorage.removeItem("role");
        }
        navigate("/login");
    };

    const handleMenuItemClick = (id) => {
        setActive(id);
        setIsOpen(false);
    };

    const currentActiveItem = menuItems.find(item => item.id === active);

    return (
        <>
            {/* Mobile Top App Bar */}
            <MobileHeaderStyled>
                <button 
                    type="button" 
                    className="menu-toggle-btn" 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
                <div className="mobile-brand">
                    <h2>{currentActiveItem ? currentActiveItem.title : "Finance Advisor"}</h2>
                </div>
                <div className="mobile-user" onClick={() => setIsOpen(true)}>
                    <img src={avatarUrl} alt="Profile" />
                </div>
            </MobileHeaderStyled>

            {/* Backdrop for Mobile Drawer */}
            {isOpen && <BackdropStyled onClick={() => setIsOpen(false)} />}

            <NavStyled
                as={motion.nav}
                className={isOpen ? "mobile-open" : ""}
            >
                <div className="drawer-close-row">
                    <button 
                        type="button" 
                        className="drawer-close-btn" 
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <motion.div
                    className="user-con"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="error-toast"
                        >
                            {errorMsg}
                        </motion.div>
                    )}
                    
                    <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                        <img src={avatarUrl} alt="Profile" />
                        <div className="overlay">Edit</div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: "none" }} 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                    </div>
                    <div className="text">
                        <h2>{username}</h2>
                        <p>$ {totalIncome()}</p>
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
                            onClick={() => handleMenuItemClick(item.id)}
                            className={active === item.id ? 'active' : ''}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                    {role === "admin" && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/admin-dashboard");
                            }}
                            style={{ marginBottom: "0.5rem", backgroundColor: "#6c5ce7" }}
                        >
                            ⚙️ Admin Panel
                        </button>
                    )}
                    <button onClick={handleLogout}> {signout} Logout</button>
                </motion.div>
            </NavStyled>
        </>
    );
}

const MobileHeaderStyled = styled.header`
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(250, 229, 250, 0.85);
    backdrop-filter: blur(10px);
    border: 2px solid #FFFFFF;
    border-radius: 18px;
    width: 100%;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

    @media (max-width: 992px) {
        display: flex;
    }

    .menu-toggle-btn {
        background: #222260;
        color: #fff;
        border: none;
        border-radius: 10px;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;

        &:active {
            transform: scale(0.95);
        }
    }

    .mobile-brand {
        h2 {
            font-size: 1.25rem;
            color: #222260;
            font-weight: 700;
            margin: 0;
        }
    }

    .mobile-user {
        cursor: pointer;
        img {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            object-fit: cover;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
    }
`;

const BackdropStyled = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(18, 18, 48, 0.45);
    backdrop-filter: blur(4px);
    z-index: 999;
`;

const NavStyled = styled(motion.nav)`
    background: rgba(250, 229, 250, 0.6);
    padding: 2rem 1.5rem;
    width: 374px;
    height: 100%;
    border: 3px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;

    .drawer-close-row {
        display: none;
        justify-content: flex-end;

        .drawer-close-btn {
            background: rgba(34, 34, 96, 0.1);
            color: #222260;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
        }
    }

    @media (max-width: 992px) {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 290px;
        max-width: 82vw;
        z-index: 1000;
        border-radius: 0 28px 28px 0;
        border-left: none;
        background: rgba(250, 229, 250, 0.95);
        backdrop-filter: blur(12px);
        box-shadow: 5px 0 25px rgba(0, 0, 0, 0.15);
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;

        &.mobile-open {
            transform: translateX(0);
        }

        .drawer-close-row {
            display: flex;
        }
    }

    .user-con {
        height: 100px;
        display: flex;
        align-items: center;
        gap: 1rem;
        img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            background: #fcf6f9;
            border: 2px solid #FFFFFF;
            padding: .2rem;
            box-shadow: 0px 1px 17px rgba(0, 0, 0, 0.06);
        }
        h2 {
            color: rgba(34, 34, 96, 1);
            font-size: 1.3rem;
            word-break: break-word;
        }
        p {
            color: rgba(34, 34, 96, 0.6);
            font-weight: 600;
        }
    }

    .avatar-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        cursor: pointer;
        overflow: hidden;
        border: 2px solid #FFFFFF;
        box-shadow: 0px 1px 17px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: none;
            padding: 0;
            box-shadow: none;
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        &:hover .overlay {
            opacity: 1;
        }
    }

    .error-toast {
        background-color: #ff6b6b;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.75rem;
        text-align: center;
        margin-bottom: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        width: 100%;
    }

    .menu-items {
        flex: 1;
        display: flex;
        flex-direction: column;
        li {
            display: grid;
            grid-template-columns: 40px auto;
            align-items: center;
            margin: 0.6rem 0;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.4s ease-in-out;
            color: rgba(34, 34, 96, 0.6);
            padding-left: 1rem;
            position: relative;

            i {
                color: rgba(34, 34, 96, 0.6);
                font-size: 1.4rem;
                transition: all 0.4s ease-in-out;
            }
        }
    }

    .active {
        color: rgba(34, 34, 96, 1) !important;
        i {
            color: rgba(34, 34, 96, 1) !important;
        }
        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: #222260;
            border-radius: 0 10px 10px 0;
        }
    }

    .bottom-nav {
        button {
            width: 100%;
            background-color:rgb(114, 114, 189);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;

            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            &:hover {
                background-color:rgb(237, 156, 245);
            }

            &:active {
                transform: scale(0.95);
            }
        }
    }
`;

export default Navigation;
