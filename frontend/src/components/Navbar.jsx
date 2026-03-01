import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "10px", background: "#222", color: "white" }}>
      <span>CodeForge AI</span>
      <button style={{ float: "right" }} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;