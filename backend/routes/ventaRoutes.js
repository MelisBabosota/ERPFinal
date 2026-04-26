const express = require("express")
const router = express.Router()
const { authMiddleware, ventas, nextVentaId, setVentas, clientes, productos } = require("../controllers/authController")

// Get all sales
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM ventas ORDER BY fecha DESC")
    res.json(rows)
  } catch (error) {
    res.json(ventas)
  }
})

// Get single sale
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    const [rows] = await pool.query("SELECT * FROM ventas WHERE id = ?", [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }
    
    res.json(rows[0])
  } catch (error) {
    const venta = ventas.find(v => v.id === parseInt(req.params.id))
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }
    res.json(venta)
  }
})

// Create sale
router.post("/", authMiddleware, async (req, res) => {
  const { cliente_id, cliente, fecha, total, estado, metodo_pago, productos: productosVenta } = req.body
  
  try {
    const pool = req.app.get("db")
    const [result] = await pool.query(
      "INSERT INTO ventas (cliente_id, cliente, fecha, total, estado, metodo_pago, productos) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [cliente_id, cliente, fecha || new Date().toISOString().split('T')[0], total, estado || "pendiente_pago", metodo_pago, productosVenta?.length || 0]
    )
    
    const [rows] = await pool.query("SELECT * FROM ventas WHERE id = ?", [result.insertId])
    
    // Update client stats
    if (cliente_id) {
      await pool.query(
        "UPDATE clientes SET pedidos = pedidos + 1, total_gastado = total_gastado + ? WHERE id = ?",
        [total, cliente_id]
      )
    }
    
    // Update product stock
    if (productosVenta && Array.isArray(productosVenta)) {
      for (const prod of productosVenta) {
        await pool.query(
          "UPDATE productos SET stock = stock - ? WHERE id = ?",
          [prod.cantidad, prod.producto_id]
        )
      }
    }
    
    res.status(201).json(rows[0])
  } catch (error) {
    const newVenta = {
      id: nextVentaId(),
      cliente_id,
      cliente: cliente || "Cliente",
      fecha: fecha || new Date().toISOString().split('T')[0],
      total,
      estado: estado || "pendiente_pago",
      metodo_pago: metodo_pago || "Efectivo",
      productos: productosVenta?.length || 0
    }
    setVentas([...ventas, newVenta])
    res.status(201).json(newVenta)
  }
})

// Update sale
router.put("/:id", authMiddleware, async (req, res) => {
  const { cliente_id, cliente, fecha, total, estado, metodo_pago } = req.body
  
  try {
    const pool = req.app.get("db")
    await pool.query(
      "UPDATE ventas SET cliente_id = ?, cliente = ?, fecha = ?, total = ?, estado = ?, metodo_pago = ? WHERE id = ?",
      [cliente_id, cliente, fecha, total, estado, metodo_pago, req.params.id]
    )
    
    const [rows] = await pool.query("SELECT * FROM ventas WHERE id = ?", [req.params.id])
    res.json(rows[0])
  } catch (error) {
    const index = ventas.findIndex(v => v.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }
    
    const updatedVenta = {
      ...ventas[index],
      cliente_id,
      cliente,
      fecha,
      total,
      estado,
      metodo_pago
    }
    
    const newVentas = [...ventas]
    newVentas[index] = updatedVenta
    setVentas(newVentas)
    
    res.json(updatedVenta)
  }
})

// Delete sale
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    await pool.query("DELETE FROM ventas WHERE id = ?", [req.params.id])
    res.json({ message: "Venta eliminada exitosamente" })
  } catch (error) {
    const index = ventas.findIndex(v => v.id === parseInt(req.params.id))
    if (index === -1) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }
    
    const newVentas = ventas.filter(v => v.id !== parseInt(req.params.id))
    setVentas(newVentas)
    
    res.json({ message: "Venta eliminada exitosamente" })
  }
})

// Get sales statistics
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const pool = req.app.get("db")
    
    const [ventasTotal] = await pool.query("SELECT SUM(total) as total, COUNT(*) as count FROM ventas")
    const [ventasMes] = await pool.query("SELECT SUM(total) as total FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE())")
    const [pedidosActivos] = await pool.query("SELECT COUNT(*) as count FROM ventas WHERE estado IN ('en_proceso', 'pendiente_pago')")
    
    res.json({
      ventasTotales: ventasTotal[0].total || 0,
      numeroVentas: ventasTotal[0].count || 0,
      ventasMes: ventasMes[0].total || 0,
      pedidosActivos: pedidosActivos[0].count || 0,
      ticketPromedio: ventasTotal[0].total && ventasTotal[0].count 
        ? ventasTotal[0].total / ventasTotal[0].count 
        : 0
    })
  } catch (error) {
    // Calculate from mock data
    const ventasTotales = ventas.reduce((sum, v) => sum + v.total, 0)
    const ventasActivas = ventas.filter(v => v.estado === "en_proceso" || v.estado === "pendiente_pago")
    
    res.json({
      ventasTotales,
      numeroVentas: ventas.length,
      ventasMes: ventasTotales * 0.3, // Approximate
      pedidosActivos: ventasActivas.length,
      ticketPromedio: ventas.length > 0 ? ventasTotales / ventas.length : 0
    })
  }
})

module.exports = router

