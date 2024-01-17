import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // object return access token or refreshtoken
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// const registerUser = asyncHandler(async (req, res) => {
//   // get user details from froentend
//   //validation -notEmpty
//   //check if user already exists: username, email
//   //check for image, check for avatar
//   // upload cloudinary, avatar
//   // create user object- create extry in db
//   // remove password and refresh token field from response
//   //check for user creation
//   //return res or error

//   const { email, username, fullname, password } = req.body;
//   //console.log("email: ", email);

//   if (
//     [email, fullname, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All the field are required");
//   }

//   let existedUser = await User.findOne({
//     //$or is a parameter . Atar vitore object pass kora hoi jeglo check kora hbe
//     Email: req.body.email
//   });

//   if (existedUser) {
//     throw new ApiError(409, "User with email or username already exists");
//   }

//   // akhane multer jakhan file ta uload korbe tar local server r path ta akhane store ho66e
//   //[0] first r property r maddhe akta object payoa jai setar access r jonno akta path nayoa hoi jeta multer add kore dei
//   //akhane middleware req r maddhe aro field add kore
//   const avatarLoacalPath = req.files?.avatar[0]?.path;
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
//   let coverImageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLoacalPath) {
//     throw new ApiError(404, "Avatar must be required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLoacalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(404, "Avatar must be required");
//   }

//   //database creation
//   const user = await User.create({
//     fullname,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     email,
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken" // select method string nei r jegulogulo chai na segulo (-) sign die lekha hoi baki gulo by default lekha hoi
//   );
//   if (!createdUser) {
//     throw new ApiError(500, "Something went wronhg while register the user");
//   }

//   //return res
//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "user register successfully"));
// });

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  //req.body thekhe data ante hbe
  //username or email
  // find the user
  // checking password is sm or not
  //acess token or refresh token generate
  //send cookie
  // res send

  const { email, username, password } = req.body;

  if (!(username || !email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exits");
  }

  const ispasswordValid = await user.isPasswordCorrect(password);

  if (!ispasswordValid) {
    throw new ApiError(404, "Invalid Credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, // ata korar reason ho66e frontend thekhe keo cookie change korte parbe na . only backend server cookie change korte parbe

    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //refreshToken delete or login user delete
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true, // ata korar reason ho66e frontend thekhe keo cookie change korte parbe na . only backend server cookie change korte parbe

    secure: true,
  };

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshToken"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!(newPassword === confirmPassword)) {
    throw new ApiError(
      400,
      "New password and Confirm Password are not the same"
    );
  }

  const user = await User.findById(req.user?._id);
  // Check current password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old  Password");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new ApiError(400, "All fields  must be updated");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email, // error aste pare
      },
    },
    { new: true } // update hoyer por je information return hoi
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account has been updated successfully"));
});

const updatedAvatar = asyncHandler(async (req, res) => {
  const avatarLoacalPath = req.file?.path;

  if (!avatarLoacalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLoacalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated succesfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }
  const coverImage = await uploadOnCloudinary(coverLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cover Image url ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated succesfully"));
});

const getChannalUserprofile = asyncHandler(async(req,res) => {
           const {username} = req.params

           if(!username?.trim()){
               throw new ApiError(400, "usernam is missing")
           }

           // aggregation pipeline
          const channel =  await User.aggregate([
              {
                //field a $ sign use korte hoi 
                  $match:{
                    username: username?.toLowerCase()
                  }
              },
              {
                 $lookup: {
                  // usermodel lowercase a hoi & pural a hoi
                  from : "subscriptions",
                  localField: "_id",
                  foreignField: "channel",
                  as: "subscribers"
                 }
              },
              {
                $lookup: {

                  from : "subscriptions",
                  localField: "_id",
                  foreignField: "subscriber",
                  as: "subscribedTo"
                 }
              },

              {
                $addFields: {
                    subscribersCount : {
                      $size: "$subscribers"
                    },
                    channalSubscribedToCount: {
                        $size: "$subscribedTo"
                    },

                    isSubscribed: {
                      $condition: {
                        if: {$in:[req.user?._id, $subscibers.subsciber]},
                        then: true,
                        else: false
                      }
                    }
                }
              }, 
              {
                // $project means ami sudhu selected jinish debo jegulo project korte hbe
                $project:{
                  fullName: 1,
                  username: 1,
                  subscribersCount: 1,
                  channalSubscribedToCount: 1,
                  isSubscribed: 1,
                  avatar: 1,
                  coverImage: 1,
                  email: 1
                }
              }

           ])

           
           if(!channel?.length){
              throw new ApiError(404, "Channel does not found")  
           }

           return res 
           .status(200)
           .json(
            new ApiResponse(200, channel[0], "user login fetch successfully" )
           )

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updatedAvatar,
  updateCoverImage,
  getChannalUserprofile
};

