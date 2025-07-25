import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { BlogContext } from '../pages/blog.page'

const CommentField = ({ action }) => {
    const {
        blog = {},
        setBlog
    } = useContext(BlogContext);

    const {
        _id,
        author: { _id: blog_author } = {},
        comments = {},
        activity = {}
    } = blog;

    const {
        total_comments = 0,
        total_parent_comments = 0
    } = activity;


    const { userAuth = {}, setUserAuth } = useContext(UserContext);
    const { access_token, username, fullname, profile_img } = userAuth;

    const [comment, setComment] = useState("");


    const handleComment = async () => {
        if (!access_token) {
            return toast.error("Vui lòng đăng nhập trước khi bình luận");
        }
        if (!comment) {
            return toast.error("Vui lòng nhập bình luận");
        }

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
                { _id, comment, blog_author },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );

            toast.success("Bình luận thành công");
            setComment("");
            data.comment_by = { personal_info: { username, fullname, profile_img } }
            let newCommmentArr;
            data.childrenLevel = 0;
            newCommmentArr = [data]
            let parentCommentIncredimentVal = 1
            setBlog({ ...blog, comments: { ...comments, results: newCommmentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncredimentVal }, });

        } catch (err) {
            console.error(err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Có lỗi xảy ra khi bình luận");
        }
    };

    return (
        <>
            <Toaster />
            <textarea value={comment} placeholder="Bình luận ở đây" className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto' onChange={(e) => setComment(e.target.value)}></textarea>
            <button className='btn-dark my-5 px-10 ' onClick={handleComment}>{action}</button>
        </>
    )
}

export default CommentField