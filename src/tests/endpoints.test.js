import { testapp, server } from "../testindex";
import supertest from "supertest";
import { upload } from "../routes/index.testroutes";

const api = supertest(testapp)

/* Tests should be done without chaging the default values of the SQL script, otherwise they will fail  
   Make sure ports 3000, 3001 and 3002 aren't being used
*/

describe("GET /products", () => {
    test("getting the table of products", async () => {
        const response = await api.get("/products").send()
        expect(response.statusCode).toBe(200)
    })

    test("products are returned as json", async () => {
        await api.get("/products")
         .expect(200)
         .expect("Content-Type", /application\/json/)
     })
})


describe("POST /products", () => {
    test("create empty product", async () => {
      await api.post("/products").send().expect(400)
    });

    test("create new product", async () => {
      const newProduct = {
        ID_ESTADO_PRODUCTO: 1,
        ID_CATEGORIA: 2,
        NOMBRE_PRODUCTO: "Super producto 1",
        STOCK: 10,
        PRECIO: 20.99
      };
      const response = await api.post("/products", upload.single("file")).send(newProduct);
      expect(response.statusCode).toBe(200);
      expect(response.body.ID_PRODUCTO).toBe(11)
      expect(response.body.ID_ESTADO_PRODUCTO).toBe("ACTIVO");
      expect(response.body.ID_CATEGORIA).toBe("SSDS");
      expect(response.body.NOMBRE_PRODUCTO).toBe(newProduct.NOMBRE_PRODUCTO);
      expect(response.body.STOCK).toBe(newProduct.STOCK);
      expect(response.body.PRECIO).toBe(newProduct.PRECIO);
    });

    test("create new product 1", async () => {
      const newProduct = {
        ID_ESTADO_PRODUCTO: 0,
        ID_CATEGORIA: 7,
        NOMBRE_PRODUCTO: "馬馬馬馬葡會意象形",
        STOCK: 100,
        PRECIO: 50
      };
      const response = await api.post("/products", upload.single("file")).send(newProduct);
      expect(response.statusCode).toBe(200);
      expect(response.body.ID_PRODUCTO).toBe(12)
      expect(response.body.ID_ESTADO_PRODUCTO).toBe("INACTIVO");
      expect(response.body.ID_CATEGORIA).toBe("MOUSEPADS");
      expect(response.body.NOMBRE_PRODUCTO).toBe(newProduct.NOMBRE_PRODUCTO);
      expect(response.body.STOCK).toBe(newProduct.STOCK);
      expect(response.body.PRECIO).toBe(newProduct.PRECIO);
    });

    test("create new product 2", async () => {
      const newProduct = {
        ID_ESTADO_PRODUCTO: 1,
        ID_CATEGORIA: 3,
        NOMBRE_PRODUCTO: "別名 秘密",
        STOCK: 999,
        PRECIO: 999.99
      };
      const response = await api.post("/products", upload.single("file")).send(newProduct);
      expect(response.statusCode).toBe(200);
      expect(response.body.ID_PRODUCTO).toBe(13)
      expect(response.body.ID_ESTADO_PRODUCTO).toBe("ACTIVO");
      expect(response.body.ID_CATEGORIA).toBe("HDDS");
      expect(response.body.NOMBRE_PRODUCTO).toBe(newProduct.NOMBRE_PRODUCTO);
      expect(response.body.STOCK).toBe(newProduct.STOCK);
      expect(response.body.PRECIO).toBe(newProduct.PRECIO);
    });

    test("create new product wrong values", async () => {
      const newProduct = {
        ID_ESTADO_PRODUCTO: 5,
        ID_CATEGORIA: -1,
        NOMBRE_PRODUCTO: "Super producto 2",
        STOCK: 10,
        PRECIO: 20.99
      };
      await api.post("/products", upload.single("file")).send(newProduct).expect(400);
    });
});


describe("PUT /products", () => {
  test("update a product", async () => {
    const toUpdate = { 
      ID_PRODUCTO: 11, 
      ID_ESTADO_PRODUCTO: 0, 
      ID_CATEGORIA: 5, 
      NOMBRE_PRODUCTO: "Super producto actualizado",
      STOCK: 500,
      PRECIO: 500000.99 
    };
    await api.put(`/update/${toUpdate.ID_PRODUCTO}`).send(toUpdate).expect(200);
  });

  test("update a inexistent product", async () => {
    const toUpdate = { 
      ID_PRODUCTO: 10000, 
      ID_ESTADO_PRODUCTO: 0, 
      ID_CATEGORIA: 5, 
      NOMBRE_PRODUCTO: "Super producto inexistente",
      STOCK: 500,
      PRECIO: 500000.99 
    };
    await api.put(`/update/${toUpdate.ID_PRODUCTO}`).send(toUpdate).expect(400);
  });
});


describe("DELETE /products", () => {
    test("delete product", async () => {
      const toDelete = { ID_PRODUCTO: 11 };
      await api.delete("/products").send(toDelete).expect(200);
    });

    test("delete multiple products", async () => {
      const toDelete = { PRODUCTOS: [12, 13] } ;
      await api.delete("/").send(toDelete).expect(200);
    });

    test("delete inexistent product using the multiple delete way", async () => {
      const toDelete = { PRODUCTOS: [14] } ;
      await api.delete("/").send(toDelete).expect(400);
    });
});

afterAll(() => {
    server.close();
 });
 