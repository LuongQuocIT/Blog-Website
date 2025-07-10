import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import Loader from "../components/loader.component";
import { UserContext } from '../App';
import AboutUser from '../components/about.component';
import filterPaginationData from '../common/filter-pagination-data';
import InPageNavigation from '../components/inpage-navigation.component';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';
import LoadMoreDataBtn from '../components/load-more.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import PageNotFound from './404.page';
export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_blogs: 0,
  },
  social_links: {},
  joinedAt: " ",
}
const ProfilePage = () => {
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");
  let { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, joinedAt } = profile;
  const { userAuth } = useContext(UserContext);
  const username = userAuth?.username || "";
  const fetchUserProfile = () => {
    // Fetch user profile data from the server
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
      username: profileId
    })
      .then(({ data: user }) => {
        if (user!==null) {
        setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);

      }).catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }
  const getBlogs = ({ page = 1, user_id }) => {
    if (!user_id && blogs?.user_id) {
      user_id = blogs.user_id;
    }
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { page, author: user_id })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id }
        })
        formatedData.user_id = user_id;
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
      });
  }

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }
    if (blogs == null) {
      resetStates();
      fetchUserProfile();
    }

  }, [profileId]);

  const resetStates = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  }
  return (
    <AnimationWrapper>
      {
        loading ? <Loader /> :
        profile_username.length?
          <section className='h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12'>
            <div className=' flex flex-col items-center  justify-center gap-5 min-w-[250px] md:w-1/3 md:sticky'>
              <img src={profile_img} alt="" className='w-48 h-48 bg-grey rounded-full md:w-32 md:h-32 ' />
              <h2 className='text-xl font-medium'>@{profile_username}</h2>
              <h1 className='text-xl capitalize h-6'>{fullname}</h1>
              <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
              <div className='flex gap-4 mt-2'>
                {
                  profileId === username ?

                    <Link to="/settings/edit-profile" className='btn-light rounded-md'>Edit Profile</Link>
                    : " "
                }
              </div>
              <AboutUser className={"max-md:hidden"} bio={bio} social_links={social_links} joinedAt={joinedAt} />
            </div>
            <div className='max-md:mt-12 w-full md:w-2/3 '>
              <InPageNavigation routes={["Blogs đã xuất bản", "About"]} defaultHidden={["About"]}>
                <>
                  {
                    blogs === null
                      ? (<Loader />)
                      : (blogs.results?.length ?
                        blogs.results.map((blog, i) => {

                          return (
                            <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={blog.blog_id}>
                              <BlogPostCard content={blog} index={i} />
                            </AnimationWrapper>
                          );
                        })
                        : <NoDataMessage message={"Không có bài viết này"} />

                      )}
                  <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
                </>
                <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />

              </InPageNavigation>
            </div>

          </section>
          :<PageNotFound/>
      }
    </AnimationWrapper>
  )
}

export default ProfilePage