import { Router } from "express";
import { loginAuth, loginToken, getProducts, getProductData, updateProduct, postProduct, getNewProductOptions, deleteProduct, deleteMultipleProducts } from "../controllers/index.testcontroller.js";
import multer from "multer";

const upload = multer();

const testrouter = Router();

testrouter.post("/login", loginAuth)
testrouter.get("/login", loginToken)
testrouter.delete("/", deleteMultipleProducts)
testrouter.get("/products", getProducts);
testrouter.post("/products", upload.single("file"), postProduct);
testrouter.delete("/products", deleteProduct);
testrouter.get("/update/:ID_PRODUCTO", getProductData);
testrouter.put("/update/:ID_PRODUCTO", upload.single("file"), updateProduct)
testrouter.get("/newProduct", getNewProductOptions);

export { testrouter, upload };