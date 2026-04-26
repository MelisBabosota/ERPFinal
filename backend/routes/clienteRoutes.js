const express = require("express")
const router = express.Router()
const { authMiddleware, clientes, nextClienteId, setClientes } = require("../controllers/authController")

// Get all clients
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM clientes ORDER BY created_at DESC")
    res.json(rows)
  } catch (error) {
    // Return mock data if database not available
    res.json(clientes)
  }
})

// Get single client
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }
    
    res.json(rows[0])
  } catch (error) {
    const cliente = clientes.find(c => c.id === parseInt(req.params.id))
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }
    res.json(cliente)
  }
})

// Create client
router.post("/", authMiddleware, async (req, res) => {
  const { nombre, email, telefono, direccion, tipo, estado } = req.body
  
  try {
    const pool = req.app.get("db")
    const [result] = await pool.query(
      "INSERT INTO clientes (nombre, email, telefono, direccion, tipo, estado, pedidos, total_gastado) VALUES (?, ?, ?, ?, ?, ?, 0, 0)",
      [nombre, email, telefono, direccion, tipo || "regular", estado || "activo"]
    )
    
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    // Add to mock data
    const newCliente = {
      id: nextClienteId(),
      nombre,
      email,
      telefono: telefono || "",
      direccion: direccion || "",
      tipo: tipo || "regular",
      estado: estado || "activo",
      pedidos: 0,
      total_gastado: 0,
      created_at: new Date()
    }
    setClientes([...clientes, newCliente])
    res.status(201).json(newCliente)
  }
})

// Update client
router.put("/:id", authMiddleware, async (req, res) => {
  const { nombre, email, telefono, direccion, tipo, estado } = req.body
  
  try {
    const pool = req.app.get("db")
    await pool.query(
      "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, tipo = ?, estado = ? WHERE id = ?",
      [nombre, email, telefono, direccion, tipo, estado, req.params.id]
    )
    
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error) {
    const index = clientes.findIndex(c => c.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }
    
    const updatedCliente = {
      ...clientes[index],
      nombre,
      email,
      telefono,
      direccion,
      tipo,
      estado
    }
    
    const newClientes = [...clientes]
    newClientes[index] = updatedCliente
    setClientes(newClientes)
    
    res.json(updatedCliente)
  }
})

// Delete client
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    await pool.query("DELETE FROM clientes WHERE id = ?", [req.params.id])
    res.json({ message: "Cliente eliminado exitosamente" })
  } catch (error) {
    const index = clientes.findIndex(c => c.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }
    
    const newClientes = clientes.filter(c => c.id !== parseInt(req.params.id))
    setClientes(newClientes)
    
    res.json({ message: "Cliente eliminado exitosamente" })
  }
})

module.exports = router

