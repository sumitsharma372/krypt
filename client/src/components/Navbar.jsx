import React from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";

import logo from "../../images/logo.png";

const NavBarItem = ({ title, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 shadow-md">
  <div className="md:flex-[0.5] flex-initial justify-center items-center">
    <img src={logo} alt="logo" className="w-32 cursor-pointer transition-transform transform hover:scale-105" />
  </div>
  <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
    {["Market", "Exchange", "Tutorials", "Wallets"].map((item, index) => (
      <NavBarItem key={item + index} title={item} classprops="transition-colors hover:text-gray-300" />
    ))}
    <li className="bg-gradient-to-r from-blue-500 to-teal-500 py-2 px-7 mx-4 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
      Login
    </li>
  </ul>
  <div className="flex relative">
    {!toggleMenu && (
      <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer transition-transform hover:scale-110" onClick={() => setToggleMenu(true)} />
    )}
    {toggleMenu && (
      <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer transition-transform hover:scale-110" onClick={() => setToggleMenu(false)} />
    )}
    {toggleMenu && (
      <ul
        className="z-10 fixed top-0 right-0 p-4 w-[70vw] h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 shadow-2xl md:hidden list-none
        flex flex-col justify-start items-end rounded-md text-white animate-slide-in transition-transform"
      >
        <li className="text-xl w-full my-2 text-right">
          <AiOutlineClose onClick={() => setToggleMenu(false)} className="cursor-pointer hover:text-gray-300 transition-colors" />
        </li>
        {["Market", "Exchange", "Tutorials", "Wallets"].map(
          (item, index) => <NavBarItem key={item + index} title={item} classprops="my-2 text-lg transition-colors hover:text-gray-300" />,
        )}
      </ul>
    )}
  </div>
</nav>

  );
};

export default Navbar;
