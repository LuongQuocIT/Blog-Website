import React, { useContext, useRef, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InputBox from '../components/input.component'
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { UserContext } from '../App';

function ChangePassword() {
  let { userAuth } = useContext(UserContext);
  let access_token = userAuth?.access_token;
  let ChangePasswordForm = useRef();
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let form = new FormData(ChangePasswordForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword || !newPassword) {
      return toast.error("Vui lòng nhập đầy đủ mật khẩu");
    }

    if (!passwordRegex.test(newPassword) || !passwordRegex.test(currentPassword)) {
      return toast.error(
        "Password must be 6-20 characters long, contain at least one uppercase letter, one lowercase letter, and one digit."
      );
    }

    setLoading(true);
    let loadingToast = toast.loading("Changing password...");

    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/change-password",
        formData, 
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      toast.dismiss(loadingToast);
      ChangePasswordForm.current.reset();
      toast.success(res.data.message);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <AnimationWrapper className="max-w-[600px] mx-auto mt-10 mb-20 px-6 py-8 bg-white rounded-lg shadow-lg">
              <Toaster position="top-right" />

      <form ref={ChangePasswordForm} onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6 max-md:hidden">Change Password</h1>
        <div className="flex flex-col gap-4">
          <InputBox
            name="currentPassword"
            type="password"
            placeholder="Mật khẩu hiện tại"
            icon="fi-rr-unlock"
            className="profile-edit-input"
          />
          <InputBox
            name="newPassword"
            type="password"
            placeholder="Mật khẩu mới"
            icon="fi-rr-unlock"
            className="profile-edit-input"
          />
          <button type="submit" className="btn-dark px-10" disabled={loading}>
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
}

export default ChangePassword;
