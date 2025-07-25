import React, { useContext, useState } from 'react'
import logo from "../imgs/logo.png"
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from '../App';
import { UserNavigationPanel } from './user-navigation.component';
import { use } from 'react';
function Navbar() {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false)
    const [userNavPanel, setUserNavPanel] = useState(false);
    const { userAuth, setUserAuth } = useContext(UserContext);
    const access_token = userAuth?.access_token;
    const access_key = userAuth?.access_key;
    const profile_img = userAuth?.profile_img;
    const navigate = useNavigate();
    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }
    const handleBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setTimeout(() => {
                setUserNavPanel(false);
            }, 200); // Delay to allow click event to register
        }
    }

    const handleSearch = (e) => {
        let query = e.target.value;
        if (e.keyCode === 13 && query) {
            setSearchBoxVisibility(false)
            navigate(`/search/${query}`);
        }
    }

    return (<>

        <nav className="navbar">
            <Link to="/" className="flex-none w-10">
                <img src={logo} alt="loi anh" className="w-full" />
            </Link>
            <div className={
                `absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw]
   md:border-0 md:relative md:inset-0 md:p-0 md:w-auto 
   ${searchBoxVisibility ? 'block' : 'hidden'} md:block`
            }>
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                    onKeyDown={handleSearch}
                />
                <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
            </div>

            <div className="flex items-center gap-3 md:gap-6 ml-auto">
                <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center" onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}>
                    <i className="fi fi-rr-search text-xl"></i>
                </button>

            </div>

            {access_token ? (
                <>
                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>Write</p>
                    </Link>
                    <Link to="/dashboard/notification">
                        <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'>
                            <i className='fi fi-rr-bell text-2xl block mt-1'></i>
                        </button>
                    </Link>
                    <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                        <button className='w-12 h-12 mt-1'>
                            <img src={profile_img} alt="" className='w-full h-full object-cover rounded-full' />
                        </button>
                        {userNavPanel ? <UserNavigationPanel /> : ""}

                    </div>
                </>
            ) : (
                <>
                    <Link className='btn-dark py-2' to="/signin">Sign In</Link>
                    <Link className='btn-light py-2 hidden md:block' to="/signup">Sign Up</Link>
                </>
            )}


        </nav >
        <Outlet />
    </>
    )
}

export default Navbar