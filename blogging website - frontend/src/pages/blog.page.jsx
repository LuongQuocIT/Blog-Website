import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer from '../components/comments.component';

export const blogStructure = {
  title: "",
  des: "",
  
  content: "",
  author: {
    personal_info: {}
  },
  banner: "",
  publishedAt: "",
}
export const BlogContext = createContext({});
function BlogPage() {
  const location = useLocation();
  const fullPath = location.pathname + location.search;
  const blog_id = decodeURIComponent(fullPath.split("/blog/")[1]); // 👈 lấy đủ kể cả sau dấu ?

  const [blog, setBlog] = useState(null);
  const [similarBlogs, setSimilarBlogs] = useState();
  const [loading, setLoading] = useState(true);
   const [isLikedByUser, setIsLikedByUser] = useState(false);
   const [commentsWrapper, setCommentsWrapper] = useState(false);
   const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          })
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blog data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlog();
    resetStates();
  }, [blog_id]); // 👈 Chỉ khi blog_id thay đổi mới gọi lại

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setIsLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };
  // ✅ Check nếu blog chưa có thì return loading
  if (!blog) return <div>Đang tải blog...</div>;

  // ✅ Safe destructure sau khi đã chắc chắn blog tồn tại
  const {
    title,
    content,
    banner,
    author: {
      personal_info: { username: author_username, fullname, profile_img }
    },
    publishedAt
  } = blog;

  return (
    <AnimationWrapper>
      {
        loading ? <Loader /> :
          <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setIsLikedByUser, commentsWrapper, setCommentsWrapper,totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
            <CommentsContainer />
            <div className='max-w-[900px] center-content py-10 max-lg:px-[5vw] '>
              <img src={banner} alt="" className='aspect-video' />
              <div className="mt-12">
                <h2>{title}</h2>
                <div className='flex max-sm:flex-col justify-between my-8'>
                  <div className='flex items-center gap-5'>
                    <img src={profile_img} alt="" className='w-12 h-12 rounded-full' />
                    <p>{fullname}</p>
                    <br />
                    <Link to={`/user/${author_username}`} className='underline'>@{author_username}</Link>
                  </div>
                  <p className=' text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>Xuất bản ngày: {getDay(publishedAt)}</p>
                </div>
              </div>
              <BlogInteraction />
              <div className='my-12 font-gelasio blog-page-content'>
                {
                  content[0]?.blocks.map((block, i) => {
                    return (
                      <div key={i} className='my-4 md:my-8'>
                        {/* {block.type === "paragraph" && <p className='text-lg leading-7'>{block.data.text}</p>}
                        {block.type === "header" && <h1 className='text-2xl font-bold'>{block.data.text}</h1>}
                        {block.type === "image" && <img src={block.data.file.url} alt={block.data.caption} className='w-full h-auto' />}
                        {block.type === "list" && (
                          <ul className='list-disc pl-5'>
                            {block.data.items.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        )} */}
                        <BlogContent block={block}  />
                      </div>
                    );
                  }
                  )
                }
              </div>
              
              {similarBlogs !== null && similarBlogs?.length ?
                <><div>
                  <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>
                  {
                    similarBlogs.map((blog, i) => {
                      let { author: { personal_info } } = blog;
                      return <AnimationWrapper key={i} className="mb-6" transition={{ duration: 0.3, delay: i * 0.1 }}>
                        <BlogPostCard key={i} content={blog} author={personal_info} />
                      </AnimationWrapper>
                    })
                  }
                </div>

                </> : " "}
            </div>
          </BlogContext.Provider>

      }
    </AnimationWrapper>
  );
}

export default BlogPage;
