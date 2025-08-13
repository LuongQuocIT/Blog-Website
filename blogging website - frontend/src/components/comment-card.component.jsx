import { useContext, useState } from 'react';
import { UserContext } from '../App';
import { BlogContext } from '../pages/blog.page';
import CommentField from './comment-field.component';
import { getDay } from '../common/date';
import axios from 'axios';

function CommentCard({ index, leftVal = 0, commentData, commentsArr, setCommentsArr }) {
  const {
    commented_by = {},
    commentedAt,
    comment,
    _id,
    children = [],
    isReplyLoaded = false,
    childrenLevel = 0,
  } = commentData || {};

  const { personal_info = {} } = commented_by;
  const { username: commented_by_username = '', fullname = '', profile_img = '' } = personal_info;

  const { blog, setBlog } = useContext(BlogContext);
  const commentsArrFromBlog = blog?.comments?.results || [];
  const blog_author = blog?.author?.personal_info?.username || '';

  const { userAuth = {} } = useContext(UserContext);
  const currentUsername = userAuth?.username || '';
  const access_token = userAuth?.access_token;

  const [isReplying, setIsReplying] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const toggleReplyInput = () => {
    if (!access_token) return alert('Bạn phải đăng nhập mới reply được');
    setIsReplying((prev) => !prev);
  };

 const deleteComment = async (e) => {
    e.target.setAttribute("disabled", "true");
    try {
        await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, 
            { _id }, 
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        // Xóa comment khỏi state
        const newComments = commentsArr.filter(c => c._id !== _id);
        setCommentsArr(newComments);
        setBlog({ ...blog, comments: { ...blog.comments, results: newComments } });
    } catch (err) {
        console.error(err);
        alert("Xoá thất bại!");
        e.target.removeAttribute("disabled");
    }
};


  const hideReplies = () => {
    let newComments = [...commentsArr];
    let i = index + 1;
    while (i < newComments.length && (newComments[i].childrenLevel || 0) > childrenLevel) {
      newComments.splice(i, 1);
    }
    newComments[index] = { ...newComments[index], isReplyLoaded: false };
    setCommentsArr(newComments);
    setBlog({ ...blog, comments: { ...blog.comments, results: newComments } });
  };

  const loadReplies = async () => {
    if (!access_token) {
      alert('Bạn phải đăng nhập mới xem được replies');
      return;
    }
    if (isReplyLoaded) {
      hideReplies();
      return;
    }
    setLoadingReplies(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: _id, skip: 0 }),
      });
      if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const repliesWithLevel = (data.replies || []).map((reply) => ({
        ...reply,
        childrenLevel: childrenLevel + 1,
      }));

      let newComments = [...commentsArr];
      newComments.splice(index + 1, 0, ...repliesWithLevel);
      newComments[index] = { ...newComments[index], isReplyLoaded: true };

      setCommentsArr(newComments);
      setBlog({ ...blog, comments: { ...blog.comments, results: newComments } });
    } catch (error) {
      console.error('Load replies lỗi:', error.message);
      alert('Load replies lỗi, thử lại sau nhé!');
    } finally {
      setLoadingReplies(false);
    }
  };

  // Chỉ hiển thị Delete khi currentUsername không rỗng và đúng người comment hoặc tác giả blog
 const canDelete =
  currentUsername && commented_by_username &&
  currentUsername === commented_by_username;

  return (
    <div
      className={`w-full p-5 rounded-lg shadow-md transition-all duration-300
        ${childrenLevel > 0 ? 'bg-gray-50 ml-6 border-l-4 border-blue-400' : 'bg-white border border-gray-300'}
      `}
      style={{ paddingLeft: `${leftVal}rem` }}
    >
      <div className="flex items-center gap-4 mb-3">
        <img
          src={
            profile_img ||
            'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?auto=format&fit=crop&w=48&q=80'
          }
          alt={`${commented_by_username} avatar`}
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
        />
        <div className="flex flex-col overflow-hidden">
          <p className="font-semibold text-gray-900 truncate max-w-xs">
            {fullname || commented_by_username}{' '}
            <span className="text-blue-600">@{commented_by_username}</span>
          </p>
          <p className="text-gray-400 text-xs">{getDay(commentedAt)}</p>
        </div>
      </div>

      <p className="ml-16 text-gray-800 leading-relaxed whitespace-pre-wrap">{comment}</p>

      <div className="flex items-center gap-6 mt-4 ml-16">
        {children.length > 0 && (
          <button
            onClick={loadReplies}
            disabled={loadingReplies}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium"
            aria-label={`${isReplyLoaded ? 'Hide' : 'View'} replies button`}
          >
            {loadingReplies
              ? 'Loading...'
              : isReplyLoaded
              ? 'Hide Replies'
              : `View Replies (${children.length})`}
          </button>
        )}

        <button
          onClick={toggleReplyInput}
          className="text-sm text-green-600 hover:underline font-medium"
          aria-label={isReplying ? 'Cancel reply' : 'Reply'}
        >
          {isReplying ? 'Cancel Reply' : 'Reply'}
        </button>

        {canDelete && (
          <button
            
            className="text-sm text-red-600 hover:underline font-medium"
            aria-label="Delete comment"
             onClick={deleteComment}
          >
            Delete
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-5 ml-16">
          <CommentField
            action="Reply"
            index={index}
            replyingTo={_id}
            commentsArr={commentsArr}
            setCommentsArr={setCommentsArr}
            setIsReplying={setIsReplying}
          />
        </div>
      )}
    </div>
  );
}

export default CommentCard;
