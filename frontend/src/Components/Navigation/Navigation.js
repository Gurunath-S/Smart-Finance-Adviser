import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import avatar from '../../img/avatar.png';
import { signout } from '../../utils/Icons';
import { menuItems } from '../../utils/menuItems';
import { useGlobalContext } from '../../context/globalContext';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

function Navigation({ active, setActive }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const { totalIncome } = useGlobalContext();

    useEffect(() => {
        const savedUsername = localStorage.getItem("username");
        setUsername(savedUsername || "Guest"); // Default to "Guest" if no username
        localStorage.getItem('userId')
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');  // Clear token
        localStorage.removeItem("username");
        navigate("/");
        alert(`You have been logged out from ID ${username}`);
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
                <img src={avatar} alt="" />
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
                {menuItems.map((item, index) => (
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
