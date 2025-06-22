import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: "djyo7mkfd",         // 👈 Tên cloud của bạn
  api_key: "179821257428433",         // 👈 Lấy trong dashboard Cloudinary
  api_secret: "3btRgzKayWf05Lcr9R5rKlLnGUg"    // 👈 Giữ kín nha
});

export {cloudinary};