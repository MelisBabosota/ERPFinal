const express = require("express")
const router = express.Router()
const { authMiddleware, productos, nextProductoId, setProductos } = require("../controllers/authController")

// Get all products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM productos ORDER BY created_at DESC")
    res.json(rows)
  } catch (error) {
    res.json(productos)
  }
})

// Get single product
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    
    res.json(rows[0])
  } catch (error) {
    const producto = productos.find(p => p.id === parseInt(req.params.id))
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json(producto)
  }
})

// Create product
router.post("/", authMiddleware, async (req, res) => {
  const { nombre, sku, categoria, stock, precio, estado } = req.body
  
  // Determine estado based on stock
  let productEstado = estado
  if (!productEstado) {
    if (stock === 0) productEstado = "agotado"
    else if (stock < 10) productEstado = "bajo_stock"
    else productEstado = "en_stock"
  }
  
  try {
    const pool = req.app.get("db")
    const [result] = await pool.query(
      "INSERT INTO productos (nombre, sku, categoria, stock, precio, estado) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, sku, categoria, stock, precio, productEstado]
    )
    
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    const newProducto = {
      id: nextProductoId(),
      nombre,
      sku,
      categoria: categoria || "",
      stock: stock || 0,
      precio: precio || 0,
      estado: productEstado,
      created_at: new Date()
    }
    setProductos([...productos, newProducto])
    res.status(201).json(newProducto)
  }
})

// Update product
router.put("/:id", authMiddleware, async (req, res) => {
  const { nombre, sku, categoria, stock, precio, estado } = req.body
  
  // Determine estado based on stock
  let productEstado = estado
  if (!productEstado) {
    if (stock === 0) productEstado = "agotado"
    else if (stock < 10) productEstado = "bajo_stock"
    else productEstado = "en_stock"
  }
  
  try {
    const pool = req.app.get("db")
    await pool.query(
      "UPDATE productos SET nombre = ?, sku = ?, categoria = ?, stock = ?, precio = ?, estado = ? WHERE id = ?",
      [nombre, sku, categoria, stock, precio, productEstado, req.params.id]
    )
    
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error) {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    
    const updatedProducto = {
      ...productos[index],
      nombre,
      sku,
      categoria,
      stock,
      precio,
      estado: productEstado
    }
    
    const newProductos = [...productos]
    newProductos[index] = updatedProducto
    setProductos(newProductos)
    
    res.json(updatedProducto)
  }
})

// Delete product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    await pool.query("DELETE FROM productos WHERE id = ?", [req.params.id])
    res.json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    const index = productos.findIndex(p => p.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    
    const newProductos = productos.filter(p => p.id !== parseInt(req.params.id))
    setProductos(newProductos)
    
    res.json({ message: "Producto eliminado exitosamente" })
  }
})

// Get low stock products
router.get("/stats/low-stock", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM productos WHERE stock < 10 AND stock > 0")
    res.json(rows)
  } catch (error) {
    const lowStock = productos.filter(p => p.stock > 0 && p.stock < 10)
    res.json(lowStock)
  }
})

module.exports = router

