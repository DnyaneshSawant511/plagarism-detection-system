import jwt from "jsonwebtoken";
const { verify } = jwt;

export default (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id: ... }
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};