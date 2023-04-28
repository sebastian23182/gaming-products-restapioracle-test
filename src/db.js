import OracleDB from "oracledb";
OracleDB.fetchAsBuffer = [ OracleDB.BLOB ]
/*OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;  Object format instead of array*/

const connect = async () => {
    const pool = await OracleDB.getConnection({
      user: "system",
      password: "123",
      connectString: "localhost/xe"
    });
    return pool;
}

export { connect };




