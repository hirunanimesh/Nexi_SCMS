import pool from "../dbConfig.js";

class Admin {
  static async getAdmin(Username) {
    const query = `SELECT * FROM store_manager join store on store_manager.Store_ID = store.store_ID WHERE store.City = "Kandy"`;

    try {
      const [results] = await pool.query(query, [Username]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getManagers() {
    const query = `SELECT * FROM store_manager order by Store_ID asc`;

    try {
      const [results] = await pool.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async getStores() {
    const query = `SELECT * FROM get_total_store_stats`;

    try {
      const [results] = await pool.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async removeManager(Manager_ID) {
    const query = "DELETE FROM store_manager WHERE Manager_ID = ?";
    try {
      const [results] = await pool.query(query, [Manager_ID]);
      return results;
    } catch (error) {
      throw error;
    }
  }
}



export default Admin;   