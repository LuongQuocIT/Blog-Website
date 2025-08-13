import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { BlogContext } from '../pages/blog.page';

const CommentField = ({
  action = 'Comment',
  onCommentSuccess,
  index,
  replyingTo,
  commentsArr = [],
  setCommentsArr = () => {},
  setReplying
}) => {
  const { blog } = useContext(BlogContext);
  const {
    _id: blogId,
    author: { _id: blog_author } = {}
  } = blog || {};

  const { userAuth = {} } = useContext(UserContext);
  const { access_token } = userAuth;
  const [comment, setComment] = useState('');

  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  const handleComment = async () => {
    if (!access_token) return toast.error('Vui lòng đăng nhập trước khi bình luận');
    if (!comment.trim()) return toast.error('Vui lòng nhập bình luận');
    if (!isValidObjectId(blogId)) return toast.error('Blog ID không hợp lệ');

    try {
      const payload = {
        _id: blogId,
        comment,
        blog_author
      };
      if (replyingTo) {
        payload.replaying_to = replyingTo;
        setReplying && setReplying(false);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        payload,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      toast.success('Bình luận thành công');
      setComment('');

      const returned = { ...data, children: data.children || [] };

      if (replyingTo && typeof index === 'number') {
        const updatedArr = [...commentsArr];
        const parent = updatedArr[index];
        if (!parent) {
          const replyObj = { ...returned, childrenLevel: 1 };
          setCommentsArr(prev => [replyObj, ...prev]);
        } else {
          const parentLevel = parent.childrenLevel || 0;
          let insertPos = index + 1;
          for (let i = index + 1; i < updatedArr.length; i++) {
            if ((updatedArr[i].childrenLevel || 0) > parentLevel) insertPos = i + 1;
            else break;
            
          }
          const replyObj = { ...returned, childrenLevel: parentLevel + 1 };
          if (!updatedArr[index].children) updatedArr[index].children = [];
          updatedArr[index].children.push(returned._id);
          updatedArr.splice(insertPos, 0, replyObj);
          setCommentsArr(updatedArr);
        }
        if (setReplying) setReplying(false);
      } else {
        const parentObj = { ...returned, childrenLevel: 0 };
        if (onCommentSuccess) onCommentSuccess(parentObj);
        else setCommentsArr(prev => [parentObj, ...prev]);
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi bình luận');
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="Bình luận ở đây"
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="btn-dark my-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
