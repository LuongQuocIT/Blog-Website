import React from 'react';
import { getDay } from '../common/date';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ content }) => {
 

  // Destructure dữ liệu có kiểm tra fallback
const {
  blog_id: id = null,
  publishedAt = null,
  tags = [],
  title = 'Không có tiêu đề',
  des = '',
  banner = '',
  activity = {}
} = content || {};

const {
  profile_img = '',
  fullname = 'Ẩn danh',
  username = 'unknown'
} = content?.author?.personal_info || {};



  const total_likes = activity.total_likes || 0;
  const formattedDate = publishedAt ? getDay(publishedAt) : "Chưa rõ ngày";

  return (
    <Link
      to={id ? `/blog/${id}` : "#"}
      className="group flex flex-col sm:flex-row gap-6 sm:gap-8 items-start border-b border-grey pb-6 mb-6 transition-all hover:scale-[1.01]"
    >
      {/* PHẦN NỘI DUNG */}
      <div className="flex-1">
        <div className="flex gap-2 items-center flex-wrap text-sm text-dark-grey mb-3">
          {profile_img && (
            <img
              src={profile_img}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <p className="line-clamp-1 font-medium">
            {fullname} <span className="text-dark-grey">@{username}</span>
          </p>
          <p className="min-w-fit">• {formattedDate}</p>
        </div>

        <h1 className="blog-title group-hover:text-primary transition-colors duration-300">
          {title}
        </h1>

        <p className="my-2 text-lg leading-7 font-gelasio text-dark-grey line-clamp-2 hidden sm:block">
          {des}
        </p>

        <div className="flex gap-4 mt-3 text-sm text-dark-grey">
          {tags[0] && (
            <span className="btn-light py-1 px-3 rounded-full">{tags[0]}</span>
          )}
          <span className="flex items-center gap-2">
            <i className="fi fi-rr-heart text-base"></i> {total_likes}
          </span>
        </div>
      </div>

      {/* PHẦN BANNER */}
      <div className="w-full sm:w-28 h-48 sm:h-28 flex-shrink-0 overflow-hidden rounded-md">
        {banner && (
          <img
            src={banner}
            alt="Blog Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
    </Link>
  );
};

export default BlogPostCard;
