import { Router } from "express";
import { loginAuth, loginToken, getProducts, getProductData, updateProduct, postProduct, getNewProductOptions, deleteProduct, deleteMultipleProducts } from "../controllers/index.controller.js";
import multer from "multer";

const upload = multer();

const router = Router();

router.post("/login", loginAuth)
router.get("/login", loginToken)
router.delete("/", deleteMultipleProducts)
router.get("/products", getProducts);
router.post("/products", upload.single("file"), postProduct);
router.delete("/products", deleteProduct);
router.get("/update/:ID_PRODUCTO", getProductData);
router.put("/update/:ID_PRODUCTO", upload.single("file"), updateProduct)
router.get("/newProduct", getNewProductOptions);

export { router, upload };