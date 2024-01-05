const asyncHandler = (requestHandler) => {
  return (err, req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(err);
  };
};

export { asyncHandler };

// const asyncHandler = (fn) => async(req, res,next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(500).json({
//             succcess:false,
//             message: error.message
//         })
//     }
// }
