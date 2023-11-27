import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from froentend
  //validation -notEmpty
  //check if user already exists: username, email
  //check for image, check for avatar
  // upload cloudinary, avatar
  // create user object- create extry in db
  // remove password and refresh token field from response
  //check for user creation
  //return res or error

  const { email, username, fullname, password } = req.body;
  console.log("email: ", email);

  if (
    [email, fullname, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All the field are required");
  }

  let existedUser = User.find({
    //$or is a parameter . Atar vitore object pass kora hoi jeglo check kora hbe
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // akhane multer jakhan file ta uload korbe tar local server r path ta akhane store ho66e
  //[0] first r property r maddhe akta object payoa jai setar access r jonno akta path nayoa hoi jeta multer add kore dei
  //akhane middleware req r maddhe aro field add kore
  const avatarLoacalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLoacalPath) {
    throw new ApiError(404, "Avatar must be required");
  }

  const avatar = await uploadOnCloudinary(avatarLoacalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(404, "Avatar must be required");
  }

  //database creation
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = User.findById(user._id).select(
    "-password -refreshToken" // select method string nei r jegulogulo chai na segulo (-) sign die lekha hoi baki gulo by default lekha hoi
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wronhg while register the user");
  }

  //return res
  return res.status(201).json(new ApiResponse(200, createdUser, ""));
});

export { registerUser };
