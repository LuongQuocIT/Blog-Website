import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../App';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';

const SideNav = () => {
    let { userAuth } = useContext(UserContext);
    let access_token = userAuth?.access_token;
    const location = useLocation();

    let page = location.pathname.split("/")[2] || "blogs";
    let [pageState, setPageState] = useState(page.replace("-", " "));
    let [showSideNav, setShowSideNav] = useState(false); // default đóng trên mobile
    let activeTabLine = useRef();
    let sideBarIconTab = useRef();
    let pageStateTab = useRef();

    const changePageState = (e) => {
        let { offsetWidth, offsetLeft } = e.target;
        if (activeTabLine.current) {
            activeTabLine.current.style.width = offsetWidth + 'px';
            activeTabLine.current.style.left = offsetLeft + 'px';
        }
        if (e.target === sideBarIconTab.current) {
            setShowSideNav(true);
        } else {
            setShowSideNav(false);
        }
    };

    useEffect(() => {
        // chỉ auto-close trên mobile
        if (window.innerWidth <= 768) {
            setShowSideNav(false);
            pageStateTab.current?.click();
        }
    }, [pageState]);

    if (!access_token) return <Navigate to="/signin" replace />;

    return (
        <section className="relative flex gap-10 py-0 m-0 zmax-md:flex-col">
            <div className="sticky top-[80%]">
                {/* Mobile top bar */}
                {/* Mobile top bar */}
                <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap items-center justify-between px-6 overflow-x-auto relative">
                    <button onClick={changePageState} ref={sideBarIconTab} className="p-5 capitalize">
                        <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
                    </button>
                    <button onClick={changePageState} ref={pageStateTab} className="p-5 w-[125px] capitalize">
                        {pageState}
                    </button>
                    <hr
                        ref={activeTabLine}
                        className="absolute bottom-0 h-[2px] bg-black border-none duration-500"
                    />
                </div>


                {/* Sidebar */}
                <div
                    className={`min-w-[200px] h-[calc(100vh-80px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-r-2 border-grey
          absolute max-md:top-[64px] max-md:left-0 max-md:w-full max-md:h-[calc(100vh-80px)] bg-white max-md:px-16 max-md:ml-7 duration-500
          ${window.innerWidth <= 768
                            ? (showSideNav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
                            : "opacity-100 pointer-events-auto"
                        }`}
                >
                    <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
                    <hr className="border-grey -ml-6 mb-8 mr-6" />
                    <NavLink onClick={(e) => setPageState(e.target.innerText)} to="/dashboard/blogs" className="sidebar-link">
                        <i className="fi fi-rr-document"></i> <p>Blogs</p>
                    </NavLink>
                    <NavLink onClick={(e) => setPageState(e.target.innerText)} to="/dashboard/notifications" className="sidebar-link">
                        <i className="fi fi-rr-bell"></i> <p>Notifications</p>
                    </NavLink>
                    <NavLink onClick={(e) => setPageState(e.target.innerText)} to="/dashboard/editor" className="sidebar-link">
                        <i className="fi fi-rr-file-edit"></i> <p>Write</p>
                    </NavLink>

                    <h1 className="text-xl text-dark-grey mb-3">Settings</h1>
                    <hr className="border-grey -ml-6 mb-8 mr-6" />
                    <NavLink onClick={(e) => setPageState(e.target.innerText)} to="/settings/edit-profile" className="sidebar-link">
                        <i className="fi fi-rr-user"></i> <p>Edit profile</p>
                    </NavLink>
                    <NavLink onClick={(e) => setPageState(e.target.innerText)} to="/settings/change-password" className="sidebar-link">
                        <i className="fi fi-rr-key"></i> <p>Change password</p>
                    </NavLink>
                </div>
            </div>

            <div className={`w-full ${showSideNav && "max-md:hidden"}`}>
                <Outlet />
            </div>
        </section>
    );
};

export default SideNav;
