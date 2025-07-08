import React from 'react'
import { Link } from 'react-router-dom';

const UserCard = ({ user }) => {
  let { personal_info: { fullname, username, profile_img }, user_id } = user;
  return (
    <Link to={`/user/${username}`} className="flex gap-4 items-center border-b border-grey pb-5 mb-4">
      <img src={profile_img} alt="" className='w-6 h-6 rounded-full' />
      <p className='line-clamp-1'>{fullname} @{username}</p>
    </Link>
  )
}

export default UserCard