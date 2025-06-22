// // src/common/cloudinary.js

// export const uploadToCloudinary = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", "blog_upload"); // 👈 Tạo ở bước 3
//   formData.append("cloud_name", "djyo7mkfd");

//   try {
//     const res = await fetch("https://api.cloudinary.com/v1_1/djyo7mkfd/image/upload", {
//       method: "POST",
//       body: formData
//     });

//     const data = await res.json();
//     return data.secure_url;
//   } catch (err) {
//     console.error("Lỗi upload Cloudinary:", err);
//     return null;
//   }
// };
