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

server.post("/create-blog", verifyJWT, (req, res) => {
    let authorId = req.user;
    let { title, des, tags, banner, content, draft } = req.body;
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
    let blogId = title.replace(/[^a-zA-z0-9] /g, " ").replace(/\s+/g, '-').trim() + nanoid();
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

})


// Khởi động server
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});