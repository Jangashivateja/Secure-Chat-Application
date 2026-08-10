import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { disable2FARoute } from "../utils/APIRoutes";
import { toast } from "react-toastify";

const Settings = ({ closeSettings }) => {
    const menuRef = useRef();
    const navigate = useNavigate();
    const [is2FAEnabled,setIs2FAEnabled] =useState(false);
    const [user, setUser] = useState(null);

    const [showDisablePrompt, setShowDisablePrompt] = useState(false);
    const [disableToken, setDisableToken] = useState("");

    const toastOptions = {
      position: "bottom-right",
      autoClose: 5000,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    };

    useEffect(() => {
        const storedUser = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setIs2FAEnabled(parsed.is2FAEnabled || false);
        }

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                closeSettings();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [closeSettings]);

    const handle2FAToggle = async () => {
        if (!is2FAEnabled) {
            navigate("/2fa-setup");
        } else {
          setShowDisablePrompt(true);
        }
    };

    const confirmDisable = async () =>{
      if(disableToken.length !==6){
        toast.error("Token must be exactly 6 digits.",toastOptions);
        return;
      }

      try {
            const { data } = await axios.post(`${disable2FARoute}/${user._id}`,{
               token: disableToken
            });

            if(data.status){
              setIs2FAEnabled(false);
              setShowDisablePrompt(false);
              setDisableToken("");

              user.is2FAEnabled = false;
              localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
              toast.success("2FA has been disabled. ",toastOptions);
            }else{
              toast.error(data.msg, toastOptions);
            }
            
        } catch (error) {
             console.error("Failed to disable 2FA", error);
        }
    }

    return (
        <Container ref={menuRef}>
            <div className="setting-modal">
                <ul>
                    {!showDisablePrompt ? (
                      <li>
                        <span>Enable 2FA</span>

                        <label className="switch">
                            <input 
                              type="checkbox" 
                              checked = {is2FAEnabled}
                              onChange={handle2FAToggle}
                            />
                            <span className="slider"></span>
                        </label>
                    </li>
                    ):(
                      <li className="disable-prompt">
                            <span className="prompt-title">Confirm Disable</span>
                            <input
                                type="text"
                                placeholder="000000"
                                maxLength="6"
                                value={disableToken}
                                onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                            />
                            <div className="prompt-actions">
                                <button className="confirm-btn" onClick={confirmDisable}>Verify</button>
                                <button className="cancel-btn" onClick={() => setShowDisablePrompt(false)}>Cancel</button>
                            </div>
                        </li>
                    )}

                    <li className="logout">
                        <Logout />
                    </li>
                </ul>
            </div>
        </Container>
    );
};

export default Settings;

const Container = styled.div`
.setting-modal {
  position: absolute;
  bottom: 50px;
  right: -3em;

  width: 220px;

  background: #1b1b32;
  border: 1px solid #4e0eff;
  border-radius: 12px;

  padding: 8px 0;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  z-index: 999;

  animation: fadeIn 0.25s ease;
}

.logout{
    border-top: 1px solid #4e0eff;
}

.setting-modal ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.setting-modal li {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 18px;

  color: #fff;
  cursor: pointer;

  transition: background 0.2s ease;
}

.setting-modal li:hover {
  background: rgba(78, 14, 255, 0.15);
}

.setting-modal .logout {
  color: #ff5c5c;
  font-weight: 600;
}

/* Disable Prompt Styles */
.disable-prompt {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center !important;
  cursor: default !important;
}

.disable-prompt:hover {
  background: transparent !important;
}

.prompt-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff5c5c;
}

.disable-prompt input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 1px solid #4e0eff;
  background: transparent;
  color: white;
  text-align: center;
  letter-spacing: 0.2rem;
  font-size: 1.1rem;
}

.disable-prompt input:focus {
  outline: none;
  border-color: #997af0;
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.prompt-actions button {
  flex: 1;
  padding: 0.4rem;
  border: none;
  border-radius: 0.3rem;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn {
  background-color: #4e0eff;
  color: white;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #666 !important;
  color: #ccc;
}

/* Toggle Switch */

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  inset: 0;

  background: #666;
  border-radius: 999px;

  cursor: pointer;
  transition: 0.3s ease;
}

.slider::before {
  content: "";

  position: absolute;
  width: 18px;
  height: 18px;

  left: 3px;
  top: 3px;

  background: #fff;
  border-radius: 50%;

  transition: 0.3s ease;
}

.switch input:checked + .slider {
  background: #4e0eff;
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}

/* Modal Animation */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;