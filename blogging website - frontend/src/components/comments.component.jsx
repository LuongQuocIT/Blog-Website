import React, { useContext, useEffect, useState } from 'react';
import { BlogContext } from '../pages/blog.page';
import CommentField from './comment-field.component';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import NoDataMessage from './nodata.component';
import CommentCard from './comment-card.component';

// Lấy parent comments từ server (server trả only parents: isReply: false)
export const fetchComments = async ({ skip = 0, blog_id, limit = 10 }) => {
  if (!blog_id || !/^[a-f\d]{24}$/i.test(blog_id)) return [];
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/get-blog-comments`,
      { blog_id, skip, limit }
    );
    // Server trả về parent comments => set childrenLevel = 0 (parent)
    return (data.comments || []).map((c) => ({ ...c, childrenLevel: 0 }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

function CommentsContainer() {
  const { blog, commentsWrapper, setCommentsWrapper, setTotalParentCommentsLoaded } =
    useContext(BlogContext);
  const { title, activity } = blog || {};
  const { total_parent_comments = 0 } = activity || {};

  const [commentsArrState, setCommentsArr] = useState([]); // flat ordered list (parents + replies inserted)
  const [loadingMore, setLoadingMore] = useState(false);

  // Load lần đầu: chỉ parent comments từ server
  useEffect(() => {
    if (!blog?._id) return;
    const loadInitialComments = async () => {
      const initialComments = await fetchComments({
        blog_id: blog._id,
        skip: 0,
        limit: 10
      });
      setCommentsArr(initialComments);
      setTotalParentCommentsLoaded?.(initialComments.length);
    };
    loadInitialComments();
  }, [blog?._id, setTotalParentCommentsLoaded]);

  // Khi có comment mới (parent) từ CommentField
  const handleNewComment = (newComment) => {
    // newComment is the server response for created comment (populated)
    // ensure it's treated as a parent
    const prepared = { ...newComment, childrenLevel: 0, children: newComment.children || [] };
    setCommentsArr((prev) => [prepared, ...prev]);
    setTotalParentCommentsLoaded?.((prev) => (prev || 0) + 1);
  };

  // Load more parents (pagination)
  const loadMoreComments = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const newComments = await fetchComments({
      blog_id: blog._id,
      skip: commentsArrState.filter(c => (c.childrenLevel || 0) === 0).length,
      limit: 10
    });
    if (newComments.length) {
      setCommentsArr((prev) => [...prev, ...newComments]);
      setTotalParentCommentsLoaded?.((prev) => (prev || 0) + newComments.length);
    }
    setLoadingMore(false);
  };

  return (
    <div
      className={
        'max-sm:w-full fixed ' +
        (commentsWrapper ? 'sm:right-0 top-0' : 'sm:right-[-100%] top-[100%]') +
        ' duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full bg-white z-50 shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden'
      }
    >
      <div className="relative">
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title || ''}
        </p>
        <button
          className="absolute right-0 flex justify-center items-center h-10 w-10 top-0 text-3xl"
          onClick={() => setCommentsWrapper(false)}
          aria-label="Close comments panel"
        >
          &times;
        </button>
      </div>

      <hr className="border-grey my-8 w-[120%] -ml-10" />

      {/* CommentField (parent comment) */}
      <CommentField action="Comment" onCommentSuccess={handleNewComment} commentsArr={commentsArrState} setCommentsArr={setCommentsArr} />

      {/* Render flat ordered list (parents and replies inserted) */}
      {commentsArrState.length > 0 ? (
        commentsArrState.map((comment, i) => (
          <AnimationWrapper key={comment._id || i}>
            <CommentCard
              index={i}
              commentData={comment}
              leftVal={comment.childrenLevel*2 || 0}
              commentsArr={commentsArrState}
              setCommentsArr={setCommentsArr}
            />
          </AnimationWrapper>
        ))
      ) : (
        <NoDataMessage message="Không có bình luận" />
      )}

      {total_parent_comments > commentsArrState.filter(c => (c.childrenLevel || 0) === 0).length && (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 mt-5"
          onClick={loadMoreComments}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

export default CommentsContainer;
