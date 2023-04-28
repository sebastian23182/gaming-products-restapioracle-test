import { connect } from "../db.js";
import { SignJWT, jwtVerify } from "jose";

export const loginAuth = async (req, res) => {
    const pool = await connect();
    const { EMAIL, PASSWORD } = req.body;
    if(!EMAIL || !PASSWORD) return res.sendStatus(400);
    try{
        const user = await pool.execute(
            "SELECT CORREO_ADMINISTRADOR, CONTRASEÑA_ADMINISTRADOR FROM ADMINISTRADOR WHERE CORREO_ADMINISTRADOR = :EMAIL", [EMAIL], {autoCommit: true}
        ) 
        if(!user) throw new Error();
        if(user.rows[0][1] !== PASSWORD) throw new Error();
        const encoder = new TextEncoder();
        const jwtConstructor = new SignJWT({}).setProtectedHeader({alg: "HS256", typ: "JWT"});
        const GUID = user.rows[0][0];
        const jwt = await jwtConstructor
        .setIssuedAt()
        .setExpirationTime("1h") //Token expiration time
        .setSubject(GUID)
        .sign(encoder.encode("qh4aKms3PXoMVQaSDJE2z6oQ24^4v^&3o"));
        pool.close();
        return res.send({ jwt });
    } catch (error) {
        pool.close();
        return res.sendStatus(401);
    }
}

export const loginToken = async (req, res) => {
    const { authorization } = req.headers;
    if(!authorization) return res.json({ res: false });
    try {
        const encoder = new TextEncoder();
        const jwtData = await jwtVerify(authorization, encoder.encode("qh4aKms3PXoMVQaSDJE2z6oQ24^4v^&3o"))
        if(jwtData){
            return res.json({ res: true });
        }
        //return res.send(jwtData)
    }catch (error){
        return res.json({ res: false });
    }
}

export const getProducts = async (req, res) => {
    const pool = await connect();
    try {
        const result = await pool.execute(
            "SELECT PRO.ID_PRODUCTO, PRO.NOMBRE_PRODUCTO, CAT.NOMBRE_CATEGORIA, PRO.STOCK, EP.NOMBRE_ESTADO_PRODUCTO, PRO.PRECIO FROM PRODUCTO PRO INNER JOIN ESTADO_PRODUCTO EP ON EP.ID_ESTADO_PRODUCTO = PRO.ID_ESTADO_PRODUCTO INNER JOIN CATEGORIA CAT ON CAT.ID_CATEGORIA = PRO.ID_CATEGORIA ORDER BY ID_PRODUCTO");
        pool.close();
        return res.json(result.rows);
    } catch (error) {
        pool.close();
        return error
    }
}

export const getProductData = async (req, res) => {
    const pool = await connect();
    try {
        const result = await pool.execute("SELECT * FROM PRODUCTO WHERE ID_PRODUCTO = :ID_PRODUCTO", [req.params.ID_PRODUCTO])
        if(!!result.rows[0]){
            if(!!result.rows[0][6]){
                const imageBuffer = await result.rows[0][6];
                const base64Image = Buffer.from(await imageBuffer).toString("base64")
                const imageUrl = `data:image/webp;base64,${base64Image}`;
                result.rows[0][6] = imageUrl;
            }
            pool.close();
            return res.json(result.rows);
        }else{
            pool.close();
            return res.sendStatus(404)
        }
    } catch (error) {
        pool.close();
        return res.sendStatus(404)
    }
}

export const updateProduct = async (req, res) => {
    const pool = await connect();
    const { ID_PRODUCTO, ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO } = req.body;
    if(isNaN(ID_ESTADO_PRODUCTO) || isNaN(ID_CATEGORIA) || !NOMBRE_PRODUCTO || !STOCK || !PRECIO){ 
        pool.close();
        return res.sendStatus(400);
    }
    if(ID_ESTADO_PRODUCTO >= 0 && ID_ESTADO_PRODUCTO <= 1 && ID_CATEGORIA >= 0 && ID_CATEGORIA <= 9 && NOMBRE_PRODUCTO.length > 0 && NOMBRE_PRODUCTO.length <= 150 && STOCK > 0 && STOCK <= 9999999999999 && PRECIO > 0 && PRECIO <= 9999999999999){
        const ESTADO_PRODUCTO = Number(ID_ESTADO_PRODUCTO) === 0 ? "INACTIVO" : "ACTIVO";
        const CATEGORIAS = ["MONITORES", "TARJETAS GRAFICAS", "SSDS", "HDDS", "MOTHERBOARDS", "MOUSES", "HEADSETS", "MOUSEPADS", "PROCESADORES", "MEMORIA RAM"];
        const CATEGORIA = CATEGORIAS[Number(ID_CATEGORIA)];
        try {
            if(!req.file){
                const result = await pool.execute("UPDATE PRODUCTO SET ID_ESTADO_PRODUCTO = :ID_ESTADO_PRODUCTO, ID_CATEGORIA = :ID_CATEGORIA, NOMBRE_PRODUCTO = :NOMBRE_PRODUCTO, STOCK = :STOCK, PRECIO = :PRECIO WHERE ID_PRODUCTO = :ID_PRODUCTO", [ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO, ID_PRODUCTO], {autoCommit: true})
                pool.close();
                if(result.rowsAffected === 0){
                    return res.sendStatus(400);
                }else{
                    return res.status(200).send({ ID_PRODUCTO: Number(ID_PRODUCTO) , ID_ESTADO_PRODUCTO: Number(ID_ESTADO_PRODUCTO), ESTADO_PRODUCTO: ESTADO_PRODUCTO, ID_CATEGORIA: Number(ID_CATEGORIA), CATEGORIA: CATEGORIA, NOMBRE_PRODUCTO: NOMBRE_PRODUCTO, STOCK: STOCK, PRECIO: PRECIO })
                }
            }else{
                const IMAGEN = req.file?.buffer;
                const result = await pool.execute("UPDATE PRODUCTO SET ID_ESTADO_PRODUCTO = :ID_ESTADO_PRODUCTO, ID_CATEGORIA = :ID_CATEGORIA, NOMBRE_PRODUCTO = :NOMBRE_PRODUCTO, STOCK = :STOCK, PRECIO = :PRECIO, IMAGEN = :IMAGEN WHERE ID_PRODUCTO = :ID_PRODUCTO", [ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO, IMAGEN, ID_PRODUCTO], {autoCommit: true})
                pool.close();
                if(result.rowsAffected === 0){
                    return res.sendStatus(400);
                }else{
                    return res.status(200).send({ ID_PRODUCTO: Number(ID_PRODUCTO) , ID_ESTADO_PRODUCTO: Number(ID_ESTADO_PRODUCTO), ESTADO_PRODUCTO: ESTADO_PRODUCTO, ID_CATEGORIA: Number(ID_CATEGORIA), CATEGORIA: CATEGORIA, NOMBRE_PRODUCTO: NOMBRE_PRODUCTO, STOCK: STOCK, PRECIO: PRECIO })
                }
            }
        } catch (error) {
            pool.close();
            return res.sendStatus(400);
        }
    }else{
        pool.close();
        return res.sendStatus(400);
    }
}

export const getNewProductOptions = async (req, res) => {
    const pool = await connect();
    const produtcStatus = (await pool.execute("SELECT ID_ESTADO_PRODUCTO, NOMBRE_ESTADO_PRODUCTO FROM ESTADO_PRODUCTO")).rows;
    const category = (await pool.execute("SELECT ID_CATEGORIA, NOMBRE_CATEGORIA FROM CATEGORIA")).rows;
    const combinedArray = [];
    combinedArray.push(produtcStatus, category);
    pool.close();
    return res.json(combinedArray);
}

export const postProduct = async (req, res) => {
    const pool = await connect();
    const { ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO } = req.body;
    if(isNaN(ID_ESTADO_PRODUCTO) || isNaN(ID_CATEGORIA) || !NOMBRE_PRODUCTO || !STOCK || !PRECIO){ 
        pool.close();
        return res.sendStatus(400);
    }
    if(ID_ESTADO_PRODUCTO >= 0 && ID_ESTADO_PRODUCTO <= 1 && ID_CATEGORIA >= 0 && ID_CATEGORIA <= 9 && NOMBRE_PRODUCTO.length > 0 && NOMBRE_PRODUCTO.length <= 150 && STOCK > 0 && STOCK <= 9999999999999 && PRECIO > 0 && PRECIO <= 9999999999999){
        const getLastID = await pool.execute("SELECT MAX(ID_PRODUCTO) FROM PRODUCTO");
        const lastID = +getLastID.rows[0] + 1;
        try {
            if(!req.file){
                await pool.execute(`INSERT INTO PRODUCTO VALUES(:ID_PRODUCTO,:ID_ESTADO_PRODUCTO,:ID_CATEGORIA,:NOMBRE_PRODUCTO,:STOCK,:PRECIO,EMPTY_BLOB())`, [lastID, ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO], {autoCommit: true})
            }else{
                const IMAGEN = req.file?.buffer;
                await pool.execute(`INSERT INTO PRODUCTO VALUES(:ID_PRODUCTO,:ID_ESTADO_PRODUCTO,:ID_CATEGORIA,:NOMBRE_PRODUCTO,:STOCK,:PRECIO,:IMAGEN)`, [lastID, ID_ESTADO_PRODUCTO, ID_CATEGORIA, NOMBRE_PRODUCTO, STOCK, PRECIO, IMAGEN], {autoCommit: true}) 
            }
        } catch (error) {
            pool.close()
            return res.sendStatus(409)
        } 
        pool.close()
        const ESTADO_PRODUCTO = ID_ESTADO_PRODUCTO === 0 ? "INACTIVO" : "ACTIVO";
        const CATEGORIAS = ["MONITORES", "TARJETAS GRAFICAS", "SSDS", "HDDS", "MOTHERBOARDS", "MOUSES", "HEADSETS", "MOUSEPADS", "PROCESADORES", "MEMORIA RAM"];
        const CATEGORIA = CATEGORIAS[ID_CATEGORIA];
        return res.status(200).send({ ID_PRODUCTO: lastID , ID_ESTADO_PRODUCTO: ESTADO_PRODUCTO, ID_CATEGORIA: CATEGORIA, NOMBRE_PRODUCTO: NOMBRE_PRODUCTO, STOCK: STOCK, PRECIO: PRECIO })
    }else{
        pool.close()
        return res.sendStatus(400);
    }
}

export const deleteProduct = async (req, res) => {
    const pool = await connect();
    const { ID_PRODUCTO } = req.body;
    if(!ID_PRODUCTO){ 
        pool.close();
        return res.sendStatus(400);
    }
    await pool.execute(`DELETE FROM PRODUCTO WHERE ID_PRODUCTO = :ID_PRODUCTO`, [ID_PRODUCTO], {autoCommit: true});
    pool.close();
    return res.sendStatus(200);
}

export const deleteMultipleProducts = async (req, res) => {
    const pool = await connect();
    const { PRODUCTOS } = req.body;
    console.log(PRODUCTOS);
    let sql = `DELETE FROM PRODUCTO WHERE ID_PRODUCTO IN (`;
    for(let i = 0; i < PRODUCTOS.length; i++)
        sql += (i > 0) ? ", :" + i : ":" + i; 
    sql += ")";
    const result = await pool.execute(sql, PRODUCTOS, {autoCommit: true})
    pool.close();
    if(result.rowsAffected === PRODUCTOS.length){
        return res.sendStatus(200);
    }else{
        return res.sendStatus(400)
    }
}

