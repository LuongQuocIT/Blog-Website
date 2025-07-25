import React, { useContext, useEffect } from 'react'
import { BlogContext } from '../pages/blog.page';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { use } from 'react';

const BlogInteraction = () => {
  const { blog, setBlog, isLikedByUser, setIsLikedByUser, setCommentsWrapper } = useContext(BlogContext);
  const { _id, blog_id, activity, author } = blog || {};
  const { total_likes, total_comments } = activity || {};
  const { username: author_username } = author?.personal_info || {};
  let { userAuth: { username } } = useContext(UserContext);
  let { userAuth } = useContext(UserContext);
  let access_token = userAuth?.access_token || "";
  useEffect(() => {
    if (access_token) {
      axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/is-liked-by-user", { _id }, {
        headers: {
          "Authorization": `Bearer ${access_token}`
        }
      }).then(({ data: { isLikedByUser } }) => {
        setIsLikedByUser(Boolean(isLikedByUser));
      }).catch((err) => {
        console.error("Error updating like status:", err);
      })
    }
  }, []);


  const handleLike = async () => {
    if (!access_token) {
      toast.error("Bạn cần đăng nhập để thực hiện hành động này");
      return;
    }

    // Tính trước like mới
    const newLikeStatus = !isLikedByUser;
    const newLikeCount = newLikeStatus ? total_likes + 1 : total_likes - 1;

    // UI cập nhật ngay
    setIsLikedByUser(newLikeStatus);
    setBlog(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        total_likes: newLikeCount,
      },
    }));
    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
        { _id, isLiked: newLikeStatus }, // gửi đúng dữ liệu mới
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      console.log("✅ Like updated:", res.data);
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Không thể cập nhật like. Vui lòng thử lại");

      // Rollback lại nếu lỗi
      setIsLikedByUser(isLikedByUser);
      setBlog(prev => ({
        ...prev,
        activity: {
          ...prev.activity,
          total_likes: total_likes,
        },
      }));
    }
  };



  return (<>
    <hr className="border-gray my-2" />
    <div className='flex gap-6 justify-between'>
      <div className="flex gap-2 items-center">
        <button
          onClick={handleLike}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLikedByUser ? "bg-red/30 hover:bg-red/50" : "bg-grey/30 hover:bg-grey/50"
            }`}
        >
          <i className={"fi " + (isLikedByUser ? "fi-sr-heart text-red" : "fi-rr-heart") + " text-2xl"}></i>
        </button>
        <p className="text-dark-grey">{total_likes} lượt thích</p>
      </div>

      <div className='flex gap-2 items-center'>
        <button onClick={() => setCommentsWrapper(prev => !prev)} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/30 hover:bg-grey/50'>
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