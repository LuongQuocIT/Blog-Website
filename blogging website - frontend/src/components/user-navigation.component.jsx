import React from 'react'
import AnimationWrapper from '../common/page-animation'
import { Link } from 'react-router-dom'
import { UserContext } from '../App';
import { removeFromSession } from '../common/session';

export const UserNavigationPanel = () => {
    const { userAuth, setUserAuth } = React.useContext(UserContext);
    const username = userAuth?.username || "unknown";
    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
    }
    return (
        <AnimationWrapper className="absolute right-0 z-50" transition={{ duration: 0.2 }}>
            <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                    <i className='fi fi-rr-file-edit'></i>
                    <p>Write</p>
                </Link>
                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    Profile
                </Link>
                <Link to={`/dashboard/blogs`} className="link pl-8 py-4">
                    Dashboard
                </Link>
                <Link to={`/settings/edit-profile`} className="link pl-8 py-4">
                    Settings
                </Link>
                <span className="absolute border-t border-grey w-[200%]"></span>
                <button className='text-left p-4 hover:bg-grey w-full pl-8 py-4' onClick={signOutUser}>
                    <h1 className='font-bold text-xl '>Sign Out</h1>
                    <p>@{username}</p>
                </button>

            </div>
        </AnimationWrapper>
    )
}
