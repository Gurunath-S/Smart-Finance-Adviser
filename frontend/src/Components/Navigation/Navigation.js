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
                        onClick={() => setActive(item.id)}
                        className={active === item.id ? 'active' : ''}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.01}}
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
                        onClick={() => navigate("/admin-dashboard")}
                        style={{ marginBottom: "0.5rem", backgroundColor: "#6c5ce7" }}
                    >
                        ⚙️ Admin Panel
                    </button>
                )}
                <button onClick={handleLogout}> {signout} Logout</button>
            </motion.div>
        </NavStyled>
    );
}

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
        }
        p {
            color: rgba(34, 34, 96, 0.6);
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
