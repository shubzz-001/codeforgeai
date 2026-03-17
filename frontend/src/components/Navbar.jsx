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
    <div className="bg-black px-6 py-4 flex justify-between items-center shadow">

      <h1 className="text-xl font-bold text-blue-400">
        CodeForge AI
      </h1>

      <button
        className="bg-red-500 px-3 py-1 rounded hover:bg-red-400"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>
  );
}

export default Navbar;