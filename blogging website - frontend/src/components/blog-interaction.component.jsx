import React, { useContext } from 'react'
import { BlogContext } from '../pages/blog.page';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';

const BlogInteraction = () => {
    let { blog: { blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog } = useContext(BlogContext);
    let { userAuth: { username } } = useContext(UserContext);
    return (<>
        <hr className="border-gray my-2" />
        <div className='flex gap-6 justify-between'>
            <div className='flex gap-2 items-center'>
                <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'>
                    <i className="fi fi-rr-heart text-2xl"></i></button>
                <p className='text-dark-grey'>{total_likes} lượt thích</p>
            </div>
            <div className='flex gap-2 items-center'>
                <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'>
                    <i className="fi fi-rr-comment text-2xl"></i></button>
                <p className='text-dark-grey'>{total_comments} bình luận</p>
            </div>
            <div className='flex gap-2 items-center'><button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'><i className="fi fi-rr-bookmark text-2xl"></i></button></div>
            <div className='flex gap-2 items-center'>
                {
                    username == author_username ?
                        <Link to={`/editor/${blog_id}`} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'>
                            <i className="fi fi-rr-edit text-2xl"></i></Link>
                        :
                        ""}
                <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'><i className="fi fi-rr-share text-2xl"></i></button></div>
        </div>
        <hr className="border-gray my-2" />
    </>


    )
}

export default BlogInteraction