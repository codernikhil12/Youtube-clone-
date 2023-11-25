import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // unique suffix ta dayoa hoi ami je file ta upload korbo setar uniquely name rakher jonno ami je kno vabe setar name rakhte pari kintu akhane seta korbo na
    cb(null, file.originalname);
    //ata pore update korte pari nijer khetra nijer jemon drkr serokom vabe
  },
});

export const upload = multer({ storage });
