import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from "nanoid";
import User from './Schema/User.js';
import jwt from 'jsonwebtoken'
import cors from 'cors';
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccountKey from "./reactjs-blog-website-5fdf7-firebase-adminsdk-fbsvc-888add70b7.json" assert { type: "json" };
import { cloudinary } from "./utils/cloudinary.js";
import multer from 'multer';
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

const server = express();
const PORT = process.env.PORT || 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage });


admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccountKey),
    }
);
// Regex check
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(
    cors({
        origin: ["http://localhost:5174", "http://localhost:5173"],
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,
    })
);
// Kết nối MongoDB
mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});

// Format data trả về cho client
const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    };
};

// Tạo username từ email, thêm hậu tố nếu bị trùng
const generateUsername = async (email) => {
    let baseUsername = email.split("@")[0];
    let username = baseUsername;

    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });

    if (isUsernameNotUnique) {
        username += nanoid(5); // Thêm 5 ký tự random
    }

    return username;
};

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ error: "Không có token xác thực" });
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token không hợp lệ" });
        }
        req.user = user.id;
        next();
    });
}
// API Đăng ký
server.post("/signup", async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Validate dữ liệu
        if (!fullname || fullname.length < 3) {
            return res.status(403).json({ error: "Fullname ít nhất 3 ký tự" });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(403).json({ error: "Email không hợp lệ" });
        }

        if (!password || !passwordRegex.test(password)) {
            return res.status(403).json({
                error: "Mật khẩu từ 6-20 ký tự, có ít nhất 1 số, 1 chữ thường, 1 chữ hoa"
            });
        }

        // Check email đã tồn tại chưa
        const isEmailUsed = await User.exists({ "personal_info.email": email });
        if (isEmailUsed) {
            return res.status(403).json({ error: "Email đã được sử dụng" });
        }

        // Tạo username và hash password
        const username = await generateUsername(email);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu user mới
        const newUser = new User({
            personal_info: {
                fullname,
                email,
                password: hashedPassword,
                username
            }
        });

        const savedUser = await newUser.save();
        return res.status(200).json(formatDataToSend(savedUser));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Lỗi server: " + err.message });
    }
});
server.post("/signin", async (req, res) => {
    let { email, password } = req.body;

    try {
        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(403).json({ error: "Email không tồn tại" });
        }

        bcrypt.compare(password, user.personal_info.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Lỗi server khi so sánh mật khẩu" });
            }

            if (!result) {
                return res.status(403).json({ error: "Mật khẩu sai" });
            }

            return res.status(200).json(formatDataToSend(user));
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Lỗi server, thử lại sau" });
    }
});
server.post("/google-auth", async (req, res) => {
    const { access_token } = req.body;

    try {
        const decodedUser = await getAuth().verifyIdToken(access_token);

        let { email, picture, name } = decodedUser;
        picture = picture?.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email });
        if (user && !user.google_auth) {
            console.log("❌ User tồn tại nhưng không bật google_auth");
            return res.status(403).json({ error: "Tài khoản này không được đăng nhập bằng Google" });
        }

        if (!user) {
            let username = await generateUsername(email);
            user = new User({
                personal_info: { fullname: name, email, username },
                google_auth: true
            });
            await user.save();
            console.log("✅ User mới đã được tạo:", user);
        }

        return res.status(200).json(formatDataToSend(user));
    } catch (err) {
        console.log("❌ BACKEND LỖI:", err.message || err);
        return res.status(500).json({ error: err.message || "Lỗi server không xác định" });
    }
});

server.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(file, {
            folder: "blog_images",
            timeout: 60000
        });

        return res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.log("🔥 Upload lỗi:", err);
        return res.status(500).json({ error: err.message });
    }
});

server.get("/trending-blogs", (req, res) => {
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})
server.post('/latest-blogs', (req, res) => {
    let { page } = req.body;
    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

server.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({ draft: false })
        .then(count => {
            return res.status(200).json({ totalDocs: count });
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        });
});

server.post("/search-blogs-count", (req, res) => {
    let { tag, query, author } = req.body;
    let findQuery;

    if (tag) {
        findQuery = { tags: tag, draft: false };
    } else if (query) {
        findQuery = { title: new RegExp(query, "i"), draft: false };
    } else
        if (author) {
            findQuery = { author, draft: false };
        }
        else {
            return res.status(403).json({ error: "You must provide tag or query to search blogs" });
        }
    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({ totalDocs: count });
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        });
});
server.post("/search-blogs", (req, res) => {
    let { tag, page, query, author, limit, eliminate_blog } = req.body;
    let findQuery
    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    } else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i') };
    } else if (author) {
        findQuery = { draft: false, author };
    }
    else {
        return res.status(403).json({ error: "You must provide tag or query to search blogs" })
    }
    let maxLimit = limit ? limit : 2
    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .limit(maxLimit)
        .skip((page - 1) * maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/search-users", (req, res) => {
    let { query, page } = req.body;
    let maxLimit = 50;
    User.find({ "personal_info.fullname": new RegExp(query, "i") })
        .limit(maxLimit)
        .select("personal_info.profile_img personal_info.username personal_info.fullname account_info.total_posts -_id")
        .sort({ "personal_info.fullname": 1 })
        .skip((page - 1) * maxLimit)
        .then(users => {
            return res.status(200).json({ users });
        })
        .catch(err => {
            return res.status(500).json({ error: err.message });
        });
});

server.post("/get-profile", (req, res) => {
    let { username } = req.body
    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(user);
        })
        .catch(err => {
            console.error("Error fetching user profile:", err);
            return res.status(500).json({ error: "Failed to fetch user profile" });
        });
})

server.post("/get-blog", (req, res) => {
    let { blog_id, draft, mode } = req.body;
    // console.log("🔎 blog_id nhận được:", blog_id);

    let incrementVal = mode !== "edit" ? 1 : 0;

    Blog.findOneAndUpdate(
        { blog_id },
        { $inc: { "activity.total_reads": incrementVal } }
    )
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname")
        .select("title des tags banner content publishedAt blog_id activity")
        .then(blog => {


            // ✅ Chỉ chạy đoạn này nếu blog có dữ liệu
            User.findOneAndUpdate(
                { "personal_info.username": blog.author?.personal_info?.username },
                { $inc: { "account_info.total_reads": incrementVal } },
            ).catch(err => {
                console.error("Error updating user reads:", err);
            });
            if (blog.draft && !draft) {
                return res.status(403).json({ error: "This blog is a draft and cannot be accessed publicly" });
            }

            return res.status(200).json({ blog });
        })
        .catch(err => {
            console.error("Error fetching blog:", err);
            return res.status(500).json({ error: "Failed to fetch blog" });
        });
});

server.post("/like-blog", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user; // string ObjectId
        const { _id: blogId, isLiked } = req.body;

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { "activity.total_likes": isLiked ? 1 : -1 } },
            { new: true }
        );

        if (isLiked) {
            await Notification.updateOne(
                { type: "like", blog: blogId, user: user_id },
                {
                    $setOnInsert: {
                        type: "like",
                        blog: blogId,
                        user: user_id,
                        notification_for: blog.author,
                    },
                },
                { upsert: true }
            );
        } else {
            await Notification.deleteMany({ type: "like", blog: blogId, user: user_id });
        }

        res.json({ likedByUser: isLiked, blog });
    } catch (err) {
        console.error("Error in /like-blog:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

server.post("/is-liked-by-user", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id: blogId } = req.body;

        const exists = await Notification.exists({
            type: "like",
            blog: blogId,
            user: user_id,
        });

        res.json({ isLikedByUser: !!exists });
    } catch (err) {
        console.error("Error checking like status:", err);
        res.status(500).json({ error: "Failed to check like status" });
    }
});

server.post("/add-comment", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user; // HOẶC req.user.id nếu verifyJWT trả object
    const { _id, comment, blog_author } = req.body;

    if (!comment || !comment.trim().length) {
      return res.status(403).json({ error: "You must provide a comment" });
    }

    if (!_id) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    const commentObj = new Comment({
      commented_by: user_id,
      comment,
      blog_author,
      blog_id: _id
    });

    const commentFile = await commentObj.save();

    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": 1
        }
      }
    );

    const notificationObj = {
      type: "comment",
      blog: _id,
      user: user_id,
      notification_for: blog_author,
      comment: commentFile._id
    };

    await new Notification(notificationObj).save();

    const { comment: cmt, commentedAt, children } = commentFile;
    return res.status(200).json({
      comment: cmt,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res.status(500).json({ error: err.message });
  }
});



server.post("/create-blog", verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, des, tags, banner, content, draft, id } = req.body;
    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title " });
    }
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog description under 200 characters" });
        }
        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it" });
        }
        if (!content.blocks.length) {
            return res.status(403).json({ error: "You must provide blog content to publish it" });
        }
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10" });
            I
        }
    }
    tags = tags.map(tag => tag.toLowerCase());
    let blogId = id || title.replace(/[^a-zA-z0-9] /g, " ").replace(/\s+/g, '-').trim() + nanoid();
    if (id) {
        Blog.findOneAndUpdate(
            { blog_id: id }, {
            title,
            des,
            tags,
            banner,
            content,
            draft: draft ? draft : false
        })
            .then((blog) => {
                if (!blog) {
                    return res.status(404).json({ error: "Blog not found" });
                }
                return res.status(200).json({ id: blog.blog_id });
            })
            .catch(err => {
                console.error("Error updating blog:", err);
                return res.status(500).json({ error: "Failed to update blog" });
            })

    } else {
        const blog = new Blog({
            title,
            des,
            tags,
            banner,
            content,
            author: authorId,
            blog_id: blogId,
            draft: Boolean(draft),
        })
        blog.save()
            .then((blog) => {
                let increment = draft ? 0 : 1;
                User.findOneAndUpdate(
                    { _id: authorId },
                    { $inc: { "account_info.total_posts": increment }, $push: { "blogs": blog._id } },
                    { new: true }
                )
                    .then(() => {
                        return res.status(200).json({ id: blog.blog_id });
                    })
                    .catch(err => {
                        return res.status(500).json({ error: "Failed to update blog" });
                    });
            })
            .catch(err => {
                return res.status(500).json({ error: err.message || "Failed to create blog" });
            });
    }

})


// Khởi động server
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});